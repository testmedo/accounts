const HD=['كود المورد','الاسم','الهاتف','المجال','العقد','كود الفاتورة','النوع','المبلغ','المدفوع','البيان','التاريخ'];
const AM={'يناير':1,'فبراير':2,'مارس':3,'ابريل':4,'أبريل':4,'مايو':5,'يونيو':6,'يوليو':7,'اغسطس':8,'أغسطس':8,'سبتمبر':9,'اكتوبر':10,'أكتوبر':10,'نوفمبر':11,'ديسمبر':12,'january':1,'february':2,'march':3,'april':4,'may':5,'june':6,'july':7,'august':8,'september':9,'october':10,'november':11,'december':12,'jan':1,'feb':2,'mar':3,'apr':4,'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12};
const p2=n=>String(n).padStart(2,'0');
const mk=(y,m,d)=>{const x=new Date(Date.UTC(y,m-1,d));return x.getUTCMonth()==m-1&&x.getUTCDate()==d?`${y}-${p2(m)}-${p2(d)}`:undefined};
// يرجع: null (فارغ) | undefined (غير مفهوم) | 'YYYY-MM-DD'
function parseDate(v){if(v==null||v==='')return null;
 if(v instanceof Date)return isNaN(v)?undefined:mk(v.getFullYear(),v.getMonth()+1,v.getDate());
 if(typeof v==='number'){if(v>20000&&v<80000){const d=new Date((Math.floor(v)-25569)*864e5);return mk(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate())}return undefined}
 const s=String(v).trim().replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776);if(!s)return null;
 if(/^\d{5}(\.\d+)?$/.test(s))return parseDate(+s);
 let m=s.match(/^(\d{4})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/);if(m)return mk(+m[1],+m[2],+m[3]);
 m=s.match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})/);if(m){let y=+m[3],d=+m[1],mo=+m[2];if(y<100)y+=2000;if(mo>12&&d<=12)[d,mo]=[mo,d];return mk(y,mo,d)}
 const low=s.toLowerCase(),nums=low.match(/\d+/g)||[];
 for(const [k,n] of Object.entries(AM))if(low.includes(k)&&nums.length>=2){let d=+nums[0],y=+nums[1];if(nums[0].length==4){y=+nums[0];d=+nums[1]}if(y<100)y+=2000;return mk(y,n,d)}
 const q=new Date(s);return isNaN(q)?undefined:mk(q.getFullYear(),q.getMonth()+1,q.getDate())}
const toTs=d=>d+' 09:00:00+00';
const TY=s=>{s=nz(s);return /^(bill|فاتورة)/.test(s)?'bill':/income|ايداع|إيداع|ايراد|إيراد/.test(s)?'income':'pay'};
function tpl(){const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,XLSX.utils.aoa_to_sheet([HD]),'data');XLSX.writeFile(w,'نموذج_الاستيراد.xlsx')}
// ================= المستورد الذكي =================
const arn=s=>nz(s).replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
const baseOf=s=>String(s==null?'':s).split(/[(（]/)[0].trim();
const fieldOf=s=>{const m=String(s==null?'':s).match(/[(（]([^)）]*)/);return m?m[1].trim():''};
const num=v=>{if(v==null||v==='')return 0;if(typeof v=='number')return v;const n=parseFloat(String(v).replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[,،\s]/g,''));return isNaN(n)?0:n};
const r2=x=>Math.round(x*100)/100,EMP=v=>v==null||String(v).trim()==='',DASH=s=>s===''||/^[-–—]+$/.test(s);
const typeOfAr=s=>{s=arn(s);if(/فاتوره|bill/.test(s))return 'bill';if(/ايداع|ايراد|income/.test(s))return 'income';if(/مدفوع|دفع|pay/.test(s))return 'pay';return null};
const TNm={pay:'مدفوع إلى',income:'إيراد من',bill:'فاتورة'};
function parseAOA(aoa){
 const hi=aoa.findIndex(r=>r&&r.filter(c=>!EMP(c)).length>=4);if(hi<0)return{err:'الملف فارغ أو بلا أعمدة'};
 const H=aoa[hi].map(c=>EMP(c)?'':String(c).trim()),has=n=>H.includes(n),ix=n=>H.indexOf(n);
 const fmt=(has('كود المورد')&&has('كود الفاتورة'))?'T':(has('رسوم')&&has('المورد')&&has('النوع')&&has('الرقم'))?'A':(has('الرقم المرجعي')&&has('الشخص')&&has('النوع')&&has('المبلغ'))?'B':null;
 if(!fmt)return{err:'صيغة الملف غير معروفة. المدعوم: كشف حساب المورد، أو مدفوعات وإيرادات الموظف، أو نموذج الاستيراد.'};
  const rows=[],bad=[];let grp='',sA=0,sC=0,sS=0,tA=null,tC=null,tS=null;
 for(let k=hi+1;k<aoa.length;k++){const r=aoa[k]||[],L='سطر '+(k+1);if(r.every(EMP))continue;
  const g=n=>EMP(r[ix(n)])?'':String(r[ix(n)]).trim(),a0=EMP(r[0])?'':String(r[0]).trim();
  if(/الاجمالي|الإجمالي/.test(a0)){if(fmt=='A'){tA=num(r[ix('رسوم')]);tC=num(r[ix('الرصيد الدائن')])}else tS=num(r[ix('المبلغ')]);continue}
  if(fmt=='T'){const nm=g('الاسم'),ic=g('كود الفاتورة'),amt0=num(r[ix('المبلغ')]),paid=Math.abs(num(r[ix('المدفوع')]));
   if(/الاجمالي|الإجمالي/.test(nm+a0)||(!nm&&!ic&&!amt0))continue;
   if(!nm){bad.push(`${L}: اسم المورد مفقود${ic?' — '+ic:''}`);continue}
   if(!ic){bad.push(`${L}: كود الفاتورة مفقود — ${nm}`);continue}
   const ty=typeOfAr(g('النوع'));if(!ty){bad.push(`${L}: النوع مفقود أو غير معروف (${g('النوع')}) — ${ic}`);continue}
   const dt=parseDate(r[ix('التاريخ')]);if(!dt){bad.push(`${L}: ${dt===null?'التاريخ مفقود':'التاريخ غير مفهوم ('+g('التاريخ')+')'} — ${ic}`);continue}
   const amt=r2(Math.abs(amt0));if(!(amt>0)){bad.push(`${L}: المبلغ صفر أو مفقود — ${ic}`);continue}
   if(paid>amt+0.001){bad.push(`${L}: المدفوع أكبر من المبلغ — ${ic}`);continue}
   if(ty!='bill'&&paid>0.001&&Math.abs(paid-amt)>0.001){bad.push(`${L}: المدفوع لا يساوي المبلغ (مدفوع إلى / إيراد من يُسجَّل كاملًا؛ للدفع الجزئي استخدم نوع فاتورة) — ${ic}`);continue}
   rows.push({line:k+1,full:nm,name:nm,field:g('المجال'),code:ic,type:ty,amount:amt,date:dt,desc:g('بيان')||g('البيان'),inherited:false,scode:g('كود المورد'),phone:g('الهاتف'),ctitle:g('العقد'),paid:ty=='bill'?paid:0});continue}
  const hasD=!EMP(r[ix('تاريخ الحركة')]),hasT=!EMP(r[ix('النوع')]);
  if(!hasD&&!hasT){if(fmt=='A'){if(a0&&r.slice(1).every(EMP))grp=a0;continue}bad.push(`${L}: سطر غير مفهوم`);continue}
  let signed,nm,code,inh=false,tax=0;
  if(fmt=='A'){const fee=num(r[ix('رسوم')]),cr=num(r[ix('الرصيد الدائن')]),ci=num(r[ix('بيانات الائتمان')]);sA+=fee;sC+=cr;signed=fee||cr||ci;tax=num(r[ix('ضريبة السلع والخدمات')]);nm=g('المورد');if(DASH(nm)){nm=grp;inh=true}code=g('الرقم')}
  else{signed=num(r[ix('المبلغ')]);sS+=signed;nm=g('الشخص');code=g('الرقم المرجعي')}
  const ty=typeOfAr(g('النوع'));if(!ty){bad.push(`${L}: نوع غير معروف (${g('النوع')})`);continue}
  const dt=parseDate(r[ix('تاريخ الحركة')]);if(!dt){bad.push(`${L}: ${dt===null?'التاريخ مفقود':'التاريخ غير مفهوم ('+g('تاريخ الحركة')+')'} — ${code}`);continue}
  if(!nm){bad.push(`${L}: اسم المورد/الشخص مفقود — ${code}`);continue}
  if(!code){bad.push(`${L}: رقم الحركة مفقود — ${nm}`);continue}
  const amt=r2(Math.abs(signed));if(!(amt>0)){bad.push(`${L}: المبلغ صفر — ${code}`);continue}
  if(ty=='pay'&&!(signed<0)){bad.push(`${L}: حركة مدفوعات بمبلغ موجب (اتجاه لا يطابق النوع) — ${code}`);continue}
  if(ty=='bill'&&!(signed>0)){bad.push(`${L}: فاتورة مورد بمبلغ سالب — ${code}`);continue}
  if(fmt=='B'&&ty=='income'&&!(signed>0)){bad.push(`${L}: إيراد بمبلغ سالب — ${code}`);continue}
  let desc=g('بيان');if(ty=='bill'&&tax>0)desc=(desc?desc+' | ':'')+'ضريبة: '+r2(tax);
  rows.push({line:k+1,full:nm,name:fmt=='B'?nm:(baseOf(nm)||nm),field:fmt=='B'?'موظف':fieldOf(nm),code,type:ty,amount:amt,date:dt,desc,inherited:inh,scode:'',phone:'',ctitle:'',paid:0})}
 const checks=[];if(fmt=='A'&&tA!=null){checks.push({l:'مجموع عمود «رسوم»',f:tA,s:r2(sA)});checks.push({l:'مجموع «الرصيد الدائن»',f:tC,s:r2(sC)})}if(fmt=='B'&&tS!=null)checks.push({l:'صافي «المبلغ»',f:tS,s:r2(sS)});
 return{fmt,rows,bad,checks}}
function buildGroups(rows,SUP,CON,old){
 const dup=[],use=[],seen=new Set();
 for(const r of rows){const k=nz(r.code);if(old.has(k)){dup.push({r,why:'موجودة مسبقًا في النظام'});continue}if(seen.has(k)){dup.push({r,why:'مكررة داخل الملف'});continue}seen.add(k);use.push(r)}
 const full={},base={},cby={},byCode={};SUP.forEach(s=>{byCode[nz(s.code)]=s;(full[arn(s.name)]=full[arn(s.name)]||[]).push(s);const b=arn(baseOf(s.name)||s.name);(base[b]=base[b]||[]).push(s)});CON.forEach(c=>(cby[c.supplier_id]=cby[c.supplier_id]||[]).push(c));
 const G=new Map();
 for(const r of use){const key=arn(r.full)+'|'+nz(r.scode||'');let g=G.get(key);if(!g){let c=[],exact=false;
  if(r.scode&&byCode[nz(r.scode)]){c=[byCode[nz(r.scode)]];exact=true}else{c=full[arn(r.full)]||[];exact=c.length==1;if(!c.length)c=base[arn(baseOf(r.name)||r.name)]||[]}
  g={key,full:r.full,name:r.name,cands:c,exact,sup:c.length==1?c[0].id:(c.length?'':'new'),nc:r.scode||'',nn:r.name,nf:r.field||'',np:r.phone||'',ct:'حساب عام',cdef:'',open:false,inh:false,rows:[]};G.set(key,g)}
  if(r.inherited)g.inh=true;g.rows.push(Object.assign({c:''},r))}
 return{groups:[...G.values()],dup,cby}}
// ---------- الحالة والواجهة ----------
let ST=null;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const rowC=(g,r)=>{if(r.c)return r.c;if(g.sup=='new')return'__new';if(!g.sup)return'';const cs=ST.cby[g.sup]||[];if(r.ctitle){const m=cs.find(c=>arn(c.title)==arn(r.ctitle));return m?m.id:'__new'}if(!cs.length)return'__new';if(cs.length==1)return cs[0].id;return g.cdef||''};
const rowTitle=(g,r)=>String(r.ctitle||g.ct||'').trim();
const needG=g=>!g.sup||g.rows.some(r=>!rowC(g,r));
function nextCode(){const used=new Set([...ST.SUP.map(s=>nz(s.code)),...ST.groups.map(g=>nz(g.nc))]);let c;do{c='NEW-'+String(ST.seq++).padStart(4,'0')}while(used.has(nz(c)));return c}
function setSup(i,v){const g=ST.groups[i];g.sup=v;if(v=='new'&&!g.nc)g.nc=nextCode();g.cdef='';g.rows.forEach(r=>r.c='');ST.errs=[];rv()}
function setF(i,k,v){ST.groups[i][k]=v}
function setCdef(i,v){ST.groups[i].cdef=v;ST.errs=[];rv()}
function setRowC(i,j,v){ST.groups[i].rows[j].c=v;ST.errs=[];rv()}
function grpHtml(g,i){const need=needG(g),s=g.sup&&g.sup!='new'?ST.SUP.find(x=>x.id==g.sup):null,cs=s?(ST.cby[s.id]||[]):[],cnt=t=>g.rows.filter(r=>r.type==t).length;
 let h=`<details class="card" style="border-color:${need?'#b3341f':'var(--line)'}" ${g.open||need?'open':''} ontoggle="ST.groups[${i}].open=this.open"><summary><b>${esc(g.full)}</b> <small>${g.rows.length} حركة (مدفوع إلى ${cnt('pay')} • إيراد من ${cnt('income')} • فاتورة ${cnt('bill')})</small> <span class="bd ${need?'off':'on'}">${need?'يحتاج اختيارًا':'جاهز'}</span></summary>`;
 if(g.inh)h+='<small style="display:block;margin-top:6px">ملاحظة: بعض الحركات كان المورد فيها (-) فنُسبت إلى عنوان هذه المجموعة في الملف.</small>';
 if(g.exact)h+=`<div class="msg">مورد موجود (تم التعرف عليه): <b>${esc(s.name)}</b> (${esc(s.code)})</div>`;
 else h+=`<label>${g.cands.length?'يوجد تطابق جزئي في الاسم — اختر المورد':'لم يُعثر على مورد بهذا الاسم'}</label><select onchange="setSup(${i},this.value)"><option value="">اختر…</option>${g.cands.map(c=>`<option value="${c.id}" ${g.sup==c.id?'selected':''}>${esc(c.name)} (${esc(c.code)})</option>`).join('')}<option value="new" ${g.sup=='new'?'selected':''}>إنشاء مورد جديد</option></select>`;
 if(g.sup=='new')h+=`<div class="grid"><div><label>كود المورد</label><input value="${esc(g.nc)}" onchange="setF(${i},'nc',this.value)"></div><div><label>الاسم</label><input value="${esc(g.nn)}" onchange="setF(${i},'nn',this.value)"></div><div><label>المجال</label><input value="${esc(g.nf)}" onchange="setF(${i},'nf',this.value)"></div><div><label>الهاتف</label><input value="${esc(g.np)}" onchange="setF(${i},'np',this.value)"></div></div><label>اسم التعاقد للحركات التي لا يحدد الملف عقدها</label><input value="${esc(g.ct)}" onchange="setF(${i},'ct',this.value)">`;
 else if(g.sup){if(!cs.length)h+=`<label>لا يوجد تعاقد لهذا المورد — سيُنشأ تعاقد باسم</label><input value="${esc(g.ct)}" onchange="setF(${i},'ct',this.value)">`;
  else if(cs.length==1&&!g.rows.some(r=>r.ctitle))h+=`<small style="display:block;margin-top:6px">ستُسجَّل الحركات على التعاقد: <b>${esc(cs[0].title)}</b></small>`;
  else if(cs.length>1&&g.rows.some(r=>!r.ctitle))h+=`<label>للمورد أكثر من تعاقد — اختر التعاقد لكل حركاته (ويمكن تخصيص حركة بعينها أدناه)</label><select onchange="setCdef(${i},this.value)"><option value="">اختر التعاقد…</option>${cs.map(c=>`<option value="${c.id}" ${g.cdef==c.id?'selected':''}>${esc(c.title)}</option>`).join('')}<option value="__new" ${g.cdef=='__new'?'selected':''}>إنشاء تعاقد جديد</option></select>`+(g.cdef=='__new'||g.rows.some(r=>r.c=='__new'&&!r.ctitle)?`<label>اسم التعاقد الجديد</label><input value="${esc(g.ct)}" onchange="setF(${i},'ct',this.value)">`:'')}
 const multi=g.sup&&g.sup!='new'&&cs.length>1;
 h+=`<div style="margin-top:8px">${g.rows.map((r,j)=>`<div class="row"><div><small>${fdate(r.date)} • ${TNm[r.type]} • ${esc(r.code)}</small>${r.desc?`<small>${esc(r.desc)}</small>`:''}${multi&&r.ctitle?`<small>العقد حسب الملف: ${esc(r.ctitle)}</small>`:''}${multi&&!r.ctitle?`<select style="font-size:14px;padding:6px;margin-top:4px;${rowC(g,r)?'':'border-color:#b3341f'}" onchange="setRowC(${i},${j},this.value)"><option value="">${g.cdef?'(التعاقد الافتراضي)':'اختر التعاقد…'}</option>${cs.map(c=>`<option value="${c.id}" ${r.c==c.id?'selected':''}>${esc(c.title)}</option>`).join('')}<option value="__new" ${r.c=='__new'?'selected':''}>تعاقد جديد</option></select>`:''}</div><div class="amt">${money(r.amount)}</div></div>`).join('')}</div></details>`;return h}
function rv(){const g=ST.groups,nd=g.filter(needG).length,cnt=t=>g.reduce((s,x)=>s+x.rows.filter(r=>r.type==t).length,0),tot=g.reduce((s,x)=>s+x.rows.length,0),ul=a=>`<ul>${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 $('#res').innerHTML=`<div class="card"><h2>مراجعة الملف — ${ST.fmt=='A'?'كشف حساب المورد':ST.fmt=='B'?'مدفوعات وإيرادات الموظف':'نموذج الاستيراد'}</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">${[['قُرئ من الملف',ST.P.rows.length+ST.P.bad.length],['ستُرفع',tot],['مكررة (لن تُرفع)',ST.dup.length],['بها مشكلة (لن تُرفع)',ST.P.bad.length],['تحتاج اختيارًا',nd]].map(([k,v])=>`<div class="stat"><small>${k}</small><b>${v}</b></div>`).join('')}</div>
<small style="display:block;margin-top:8px">مدفوع إلى: ${cnt('pay')} • إيراد من: ${cnt('income')} • فاتورة: ${cnt('bill')} (تبقى غير مدفوعة حتى اعتماد الدفع أو الحذف)</small>
${ST.P.checks.map(c=>{const ok=Math.abs(c.f-c.s)<0.01;return `<div class="msg ${ok?'':'e'}">${c.l}: الملف ${money(c.f)} • المقروء ${money(c.s)} — ${ok?'✓ مطابق':'✗ غير مطابق، راجع الملف'}</div>`}).join('')}
${(ST.errs||[]).length?`<div class="msg e"><b>أكمل التالي قبل التأكيد:</b>${ul(ST.errs)}</div>`:''}</div>`
 +g.map(grpHtml).join('')
 +(ST.dup.length?`<details class="card"><summary><b>فواتير مكررة لن تُرفع (${ST.dup.length})</b></summary>${ul(ST.dup.map(d=>`سطر ${d.r.line}: ${d.r.code} — ${d.r.full} — ${d.why}`))}</details>`:'')
 +(ST.P.bad.length?`<details class="card" open><summary><b>سطور بها مشكلة ولن تُرفع (${ST.P.bad.length})</b></summary>${ul(ST.P.bad)}</details>`:'')
 +`<div class="grid"><button class="b" onclick="confirmImp()">تأكيد الاستيراد</button><button class="b g" onclick="cancelImp()">إلغاء</button></div>`}
function cancelImp(){ST=null;$('#res').innerHTML='';msg('تم إلغاء الاستيراد دون حفظ أي بيانات')}
async function attachMonths(items){const need=new Map();
 for(const it of items){const k=it.cid+'|'+it.r.date.slice(0,7);if(!ST.MS[k])need.set(k,{contract_id:it.cid,month:it.r.date.slice(0,7)+'-01',created_by:ST.U.id})}
 if(need.size){const arr=[...need.values()];
  try{(await api('contract_months','POST',arr)).forEach(m=>ST.MS[m.contract_id+'|'+m.month.slice(0,7)]=m.id)}
  catch(e){for(const a of arr){const k=a.contract_id+'|'+a.month.slice(0,7),q=`contract_months?contract_id=eq.${a.contract_id}&month=eq.${a.month}&select=id`;let r=await api(q);if(!r.length)r=await api('contract_months','POST',a);ST.MS[k]=r[0].id}}}
 items.forEach(it=>it.mid=ST.MS[it.cid+'|'+it.r.date.slice(0,7)])}
async function insChunk(items,sid){const U=ST.U.id,m=new Map(items.map(x=>[x.r.code,x.r])),iv=await api('invoices','POST',items.map(({r,cid,mid})=>({contract_id:cid,supplier_id:sid,month_id:mid||null,dest:'accounts',type:r.type,code:r.code,amount:r.amount,description:r.desc||null,created_by:U,created_at:toTs(r.date)}))),pays=[];
 iv.forEach(v=>{const r=m.get(v.code),at=toTs(r.date);if(r.type!='bill')pays.push({invoice_id:v.id,amount:r.amount,status:'approved',created_by:U,approved_by:U,created_at:at,decided_at:at});else if(r.paid>0)pays.push({invoice_id:v.id,amount:r.paid,created_by:U,created_at:at})});
 try{if(pays.length)await api('payments','POST',pays)}catch(e){try{await api('invoices?id=in.('+iv.map(v=>v.id).join(',')+')','DELETE')}catch(_){}throw e}}
async function confirmImp(){try{const G=ST.groups,errs=[],codes=new Set(ST.SUP.map(s=>nz(s.code))),nc=new Set();
 G.forEach(x=>{if(!x.sup){errs.push('حدد المورد: '+x.full);return}
  if(x.sup=='new'){const c=nz(x.nc);if(!c)errs.push('أدخل كود المورد الجديد: '+x.full);else if(codes.has(c)||nc.has(c))errs.push(`كود المورد مكرر (${x.nc}): ${x.full}`);else nc.add(c);if(!x.nn.trim())errs.push('أدخل اسم المورد: '+x.full)}
  const un=x.rows.filter(r=>!rowC(x,r));if(un.length)errs.push(`حدد التعاقد (${un.length} حركة): ${x.full}`);
  if(x.rows.some(r=>rowC(x,r)=='__new'&&!rowTitle(x,r)))errs.push('أدخل اسم التعاقد الجديد: '+x.full)});
 if(errs.length){ST.errs=errs;rv();msg('يوجد '+errs.length+' نقص — راجع البطاقات الحمراء',1);$('#res').scrollIntoView();return}
 const total=G.reduce((s,x)=>s+x.rows.length,0);$('#res').innerHTML=`<div class="msg">جارٍ الاستيراد… لا تغلق الصفحة (<span id="pg">0</span> / ${total})</div>`;
 const old=new Set((await apiAll('invoices?select=code')).map(i=>nz(i.code)).filter(Boolean)),R={ok:{pay:0,income:0,bill:0},dup:[],fail:[],ns:0,nc:0};let done=0;
 for(const x of G){let sid=x.sup;
  try{if(sid=='new'){sid=(await api('suppliers','POST',{code:x.nc.trim(),name:x.nn.trim(),phone:x.np.trim()||null,field:x.nf.trim()||null}))[0].id;R.ns++}}catch(e){x.rows.forEach(r=>R.fail.push(`سطر ${r.line}: ${r.code} — تعذر إنشاء المورد: ${errT(e)}`));done+=x.rows.length;$('#pg').textContent=done;continue}
  const cs=x.sup=='new'?[]:(ST.cby[x.sup]||[]),ncm={},items=[];
  for(const r of x.rows){if(old.has(nz(r.code))){R.dup.push(`سطر ${r.line}: ${r.code} — موجودة مسبقًا`);continue}
   try{let cid=rowC(x,r);if(cid=='__new'){const t=rowTitle(x,r),k=arn(t);if(!ncm[k]){const ex=cs.find(c=>arn(c.title)==k);if(ex)ncm[k]=ex.id;else{const ds=x.rows.filter(rr=>rowC(x,rr)=='__new'&&arn(rowTitle(x,rr))==k).map(rr=>rr.date).sort(),a=ds[0],b=ds[ds.length-1],ed=new Date(Date.UTC(+b.slice(0,4),+b.slice(5,7),0)).toISOString().slice(0,10);
   ncm[k]=(await api('contracts','POST',{supplier_id:sid,title:t,start_date:a.slice(0,7)+'-01',end_date:ed,created_by:ST.U.id}))[0].id;R.nc++;cs.push({id:ncm[k],title:t})}}cid=ncm[k]}items.push({r,cid})}catch(e){R.fail.push(`سطر ${r.line}: ${r.code} — ${errT(e)}`)}}
  try{await attachMonths(items)}catch(e){items.forEach(it=>R.fail.push(`سطر ${it.r.line}: ${it.r.code} — تعذر ربط الشهر التعاقدي: ${errT(e)}`));done+=items.length;$('#pg').textContent=done;continue}
  for(let i=0;i<items.length;i+=100){const ch=items.slice(i,i+100);
   try{await insChunk(ch,sid);ch.forEach(it=>{old.add(nz(it.r.code));R.ok[it.r.type]++})}
   catch(e){for(const it of ch){try{await insChunk([it],sid);old.add(nz(it.r.code));R.ok[it.r.type]++}catch(e2){R.fail.push(`سطر ${it.r.line}: ${it.r.code} — ${errT(e2)}`)}}}
   done+=ch.length;$('#pg').textContent=done}}
 const ul=a=>`<ul>${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`,n=R.ok.pay+R.ok.income+R.ok.bill;
 $('#res').innerHTML=`<div class="card"><h2>نتيجة الاستيراد</h2><div class="msg">تم رفع ${n} حركة: مدفوع إلى ${R.ok.pay} • إيراد من ${R.ok.income} • فاتورة ${R.ok.bill}${R.ns?` • موردون جدد ${R.ns}`:''}${R.nc?` • تعاقدات جديدة ${R.nc}`:''}</div>${R.dup.length?`<div class="msg e"><b>لم تُرفع (${R.dup.length}) مكررة:</b>${ul(R.dup)}</div>`:''}${R.fail.length?`<div class="msg e"><b>فشلت (${R.fail.length}) — لم يُحفظ منها شيء:</b>${ul(R.fail)}</div>`:''}</div>`;
 ST=null;const fi=$('#f');if(fi)fi.value='';msg(`انتهى الاستيراد: ${n} مرفوعة، ${R.dup.length} مكررة، ${R.fail.length} فاشلة`,R.fail.length>0);if(window.load)load()}catch(e){msg(errT(e),1)}}
async function importXlsx(f,U){try{if(!f)return msg('اختر ملفًا',1);msg('جارٍ قراءة الملف...');
 const wb=XLSX.read(await f.arrayBuffer(),{cellDates:false}),ws=wb.Sheets.data||wb.Sheets[wb.SheetNames[0]],P=parseAOA(XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:null}));
 if(P.err)return msg(P.err,1);
 const [SUP,CON,INV,MN]=await Promise.all([apiAll('suppliers?select=id,code,name'),apiAll('contracts?select=id,supplier_id,title'),apiAll('invoices?select=code'),apiAll('contract_months?select=id,contract_id,month')]);
 const B=buildGroups(P.rows,SUP,CON,new Set(INV.map(i=>nz(i.code)).filter(Boolean)));
 const MS={};MN.forEach(m=>MS[m.contract_id+'|'+m.month.slice(0,7)]=m.id);
 ST={U,MS,fmt:P.fmt,P,SUP,CON,cby:B.cby,groups:B.groups,dup:B.dup,seq:1,errs:[]};ST.groups.forEach(g=>{if(g.sup=='new'&&!g.nc)g.nc=nextCode()});
 if(!P.rows.length&&!P.bad.length)return msg('لا توجد حركات في الملف',1);rv();msg('راجع النتيجة أدناه ثم اضغط «تأكيد الاستيراد» — لم يُحفظ شيء بعد');$('#res').scrollIntoView()}catch(e){msg(errT(e),1)}}
