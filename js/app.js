const SB='https://jupcllnvlaxsvfyoyisb.supabase.co',KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cGNsbG52bGF4c3ZmeW95aXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzUxOTcsImV4cCI6MjEwNjc1MTE5N30.wfjngx7XEfXz432ZpRNFiSMvcxNRdhotuvelmltEcLI';
async function api(path,method='GET',body,prefer='return=representation'){
 const r=await fetch(SB+'/rest/v1/'+path,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:prefer},body:body?JSON.stringify(body):undefined});
 const t=await r.text();if(!r.ok){const e=new Error(t);e.dup=/23505/.test(t);throw e}return t?JSON.parse(t):[]}
// جلب كل الصفوف على دفعات (مشترك لكل الصفحات)
async function apiAll(p){let o=[],i=0;p=/order=/.test(p)?p.replace(/order=([^&]+)/,'order=$1,id'):p+(p.includes('?')?'&':'?')+'order=id';for(;;){const r=await api(p+'&limit=1000&offset='+i);o=o.concat(r);if(r.length<1000)return o;i+=1000}}
async function upload(file){
 const n=Date.now()+'_'+file.name.replace(/[^\w.]/g,'');
 const r=await fetch(`${SB}/storage/v1/object/photo/${n}`,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':file.type},body:file});
 if(!r.ok)throw new Error(await r.text());return `${SB}/storage/v1/object/public/photo/${n}`}
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const $=s=>document.querySelector(s);
const me=()=>JSON.parse(sessionStorage.getItem('u')||'null');
const money=n=>Number(n||0).toLocaleString('ar-EG',{maximumFractionDigits:2})+' ج.م';
const fdate=d=>new Date(d).toLocaleDateString('ar-EG');
const home={treasury:'treasury.html',accountant:'accountant.html',manager:'approvals.html',chairman:'chairman.html',admin:'admin.html'};
const links={treasury:[['treasury.html','الخزينة'],['students.html','إيرادات الطلاب'],['report.html','التقارير']],accountant:[['accountant.html','المحاسبة'],['report.html','كشف الحساب']],manager:[['approvals.html','الاعتمادات'],['treasury.html','الخزينة'],['students.html','إيرادات الطلاب'],['audit.html','سجل التدقيق'],['accountant.html','المحاسبة'],['report.html','كشف الحساب'],['chairman.html','متابعة المورد']],chairman:[['chairman.html','متابعة المورد']],admin:[['admin.html','الرفع'],['treasury.html','الخزينة'],['students.html','إيرادات الطلاب'],['audit.html','سجل التدقيق'],['users.html','الحسابات'],['manage.html','التعديل والحذف'],['report.html','التقارير'],['accountant.html','المحاسبة'],['approvals.html','الاعتمادات'],['chairman.html','متابعة المورد']]};
const IC={user:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6',folder:'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',receipt:'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',wallet:'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l3-3h12M16 14h2',list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',cal:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',coin:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15',shield:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM9 12l2 2 4-4',up:'M12 3v12M7 8l5-5 5 5M5 21h14',edit:'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',chart:'M3 3v18h18M7 15l4-4 3 3 5-6'};
const card=(ic,t,s,on)=>`<button class="ct" onclick="${on}"><span class="ci"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[ic]}"/></svg></span><span class="cx"><b>${t}</b><small>${s}</small></span><span class="cv">‹</span></button>`;
function guard(roles){const u=me();if(!u||!roles.includes(u.role)){location.href='index.html';return null}
 const cur=location.pathname.split('/').pop();
 document.body.insertAdjacentHTML('afterbegin',`<header><img src="assets/logo.png" alt="شعار الجامعة"><h1>${u.full_name}</h1><button onclick="sessionStorage.clear();location.href='index.html'">خروج</button></header>`+(links[u.role].length>1?`<nav>${links[u.role].map(l=>`<a href="${l[0]}" class="${l[0]==cur?'on':''}">${l[1]}</a>`).join('')}</nav>`:''));
 document.body.insertAdjacentHTML('beforeend','<footer><img src="assets/logo.png" alt=""><span>نظام متابعة مدفوعات الموردين والمقاولين</span></footer>');return u}
const paidOf=i=>(i.payments||[]).filter(p=>p.status=='approved').reduce((s,p)=>s+Number(p.amount),0);
const msg=(t,e)=>{const m=$('#msg');m.className='msg'+(e?' e':'');m.textContent=t;m.scrollIntoView({block:'center'})};

const nz=s=>String(s==null?'':s).trim().replace(/\s+/g,' ').toLowerCase();
const errT=e=>{if(e.dup)return'هذا السجل مكرر ولا يمكن إضافته أو حفظه';try{const j=JSON.parse(e.message);if(j&&j.code=='P0001')return j.message}catch(_){}return'خطأ: '+e.message};

const pendOf=i=>(i.payments||[]).filter(p=>p.status=='pending').reduce((s,p)=>s+Number(p.amount),0);

function months(list,dk,row,tot,ft){const g={};list.forEach(x=>{const d=new Date(dk(x)),k=d.getUTCFullYear()+'-'+d.getUTCMonth();(g[k]=g[k]||{y:d.getUTCFullYear(),m:d.getUTCMonth(),a:[]}).a.push(x)});
return Object.values(g).sort((a,b)=>b.y*12+b.m-a.y*12-a.m).map(m=>{const f=new Date(m.y,m.m,1),l=new Date(m.y,m.m+1,0);
return `<div class="mh"><b>${f.toLocaleDateString('ar-EG',{month:'long',year:'numeric'})}</b><span>بداية الشهر: ${fdate(f)}</span></div><div class="mb">${m.a.map(row).join('')}</div><div class="mf">نهاية الشهر: ${fdate(l)} • ${ft?ft(m.a):`إجمالي الشهر: <b>${money(m.a.reduce((s,x)=>s+tot(x),0))}</b>`}</div>`}).join('')}

// ===== التاريخ والشهور =====
const ts=d=>d+' 09:00:00+00';
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const mlabel=m=>new Date(String(m).slice(0,7)+'-01T00:00:00Z').toLocaleDateString('ar-EG',{month:'long',year:'numeric',timeZone:'UTC'});
const fdu=s=>new Date(String(s).slice(0,10)+'T00:00:00Z').toLocaleDateString('ar-EG',{timeZone:'UTC'});
const rnd=x=>Math.round(x*100)/100;
function monthsBetween(a,b){const o=[];let y=+a.slice(0,4),m=+a.slice(5,7);const ey=+b.slice(0,4),em=+b.slice(5,7);while(y<ey||(y==ey&&m<=em)){o.push(y+'-'+String(m).padStart(2,'0')+'-01');m++;if(m>12){m=1;y++}}return o}
async function ensureMonth(cid,dateStr,uid){const m=String(dateStr).slice(0,7)+'-01',q=`contract_months?contract_id=eq.${cid}&month=eq.${m}&select=id`;
 let r=await api(q);if(r.length)return r[0].id;
 try{r=await api('contract_months','POST',{contract_id:cid,month:m,created_by:uid||null});return r[0].id}catch(e){r=await api(q);if(r.length)return r[0].id;throw e}}
// ===== سجل التدقيق (يُسجَّل باسم المستخدم الحالي) =====
async function audit(action,entity,eid,cid,oldv,newv,note){const u=me();
 try{await api('audit_log','POST',{user_id:u.id,user_name:u.full_name,action,entity:entity||null,entity_id:eid||null,contract_id:cid||null,old_value:oldv||null,new_value:newv||null,note:note||null},'return=minimal')}
 catch(e){throw new Error('تمت العملية لكن تعذر تسجيلها في سجل التدقيق: '+e.message)}}
// ===== غرامة التأخير: نسبة شهرية على المتبقي من آخر موعد/تحصيل حتى يوم السداد، (أيام ÷ 30) =====
const D0=s=>{const d=new Date(String(s).length>10?s:s+'T00:00:00Z');return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};
function _lateInfo(inv,monthStr,contract,payDate){
 const gd=+(contract&&contract.grace_day||10),rate=contract&&contract.late_rate!=null?+contract.late_rate:20,y=+monthStr.slice(0,4),mo=+monthStr.slice(5,7),deadline=Date.UTC(y,mo-1,gd);
 const ps=(inv.payments||[]).filter(p=>p.status=='approved').sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)),bal=rnd(inv.amount-ps.reduce((s,p)=>s+ +p.amount,0));
 const last=ps.length?D0(ps[ps.length-1].created_at):0,S=Math.max(deadline,last),P=D0(payDate),days=Math.max(0,Math.round((P-S)/864e5)),fee=bal>0?rnd(bal*rate/100*days/30):0;
 const iso=t=>new Date(t).toISOString().slice(0,10);
 return{bal,rate,days,fee,deadline:iso(deadline),from:iso(S),to:iso(P),note:days>0?`غرامة تأخير ${rate}% شهريًا على المتبقي ${bal} من ${iso(S)} إلى ${iso(P)} (${days} يوم): ${fee}`:''}}

const kindOf=i=>i.type=='income'?(i.cr&&i.cr.role=='treasury'?'deposit':'collect'):'pay';
const KN={collect:'تحصيل',deposit:'إيداع',pay:'دفع / صرف'};

// غرامة التأخير تُطبَّق فقط على العقد السنوي (بفترة زمنية وعقود شهرية) الذي فُعِّلت له الغرامة (contracts.late_fee)، وليس على أي إيداع
function lateInfo(inv,monthStr,contract,payDate){const r=_lateInfo(inv,monthStr,contract,payDate);if(contract&&contract.late_fee&&!(inv&&inv.fee_incl))return r;return{...r,days:0,fee:0,note:'',off:true}}

// ===== إيصال دفع / إيداع قابل للطباعة من المتصفح (يظهر فور إنشاء الفاتورة أو من آخر العمليات) =====
function closeReceipt(){const e=document.getElementById('rcov');if(e)e.remove();document.body.classList.remove('rcp');const s=document.getElementById('rcpg');if(s)s.remove()}
function showReceipt(d){closeReceipt();const E=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),isP=d.kind=='pay',u=me();
 const rows=[['المورد',d.supplier],['العقد الرئيسي',d.contract],['الشهر التعاقدي',d.month],['نوع الفاتورة',d.typeLabel],['توجيه الفاتورة إلى',d.destLabel],['كود الفاتورة',d.code],['تاريخ الفاتورة',d.date],['المبلغ',d.amount]].concat(d.rows||[],[['صورة الفاتورة الورقية',d.image?'مرفقة':'غير مرفقة'],['البيان',d.desc||'—']]).filter(r=>r[1]!=null&&r[1]!==''),
  wide=r=>r[0]=='البيان'||String(r[1]).length>38,S=rows.filter(r=>!wide(r)),Wd=rows.filter(wide);let tb='';
 for(let k=0;k<S.length;k+=2){const a=S[k],b=S[k+1];tb+=`<tr><th>${E(a[0])}</th><td>${E(a[1])}</td>${b?`<th>${E(b[0])}</th><td>${E(b[1])}</td>`:'<td colspan="2"></td>'}</tr>`}
 Wd.forEach(r=>{tb+=`<tr><th>${E(r[0])}</th><td colspan="3">${E(r[1])}</td></tr>`});
 const o=document.createElement('div');o.id='rcov';o.className='rc-ov';
 o.innerHTML=`<div class="rc-bar"><b>${E(d.banner||'')}</b><div><button class="b s" onclick="window.print()">طباعة الإيصال</button> <button class="b s g" onclick="closeReceipt()">إغلاق</button></div></div>
<div class="rc-sheet">${d.done?`<div class="rc-wm">${isP?'تم الصرف':'تم الإيداع'}</div>`:''}<div class="rc-h"><img src="assets/logo.png" alt=""><div><small>نظام متابعة مدفوعات الموردين والمقاولين</small><div class="rc-t">${isP?'إيصال دفع':'إيصال إيداع'}</div></div><div class="rc-n">رقم: ${E(d.code)}</div></div>
<table class="rc-tb">${tb}</table>
<div class="rc-sig"><div><div class="ln"></div><b>${d.src=='treasury'?'توقيع محاسب الخزينة':'توقيع مدير الحسابات'}</b></div><div><div class="ln"></div><b>توقيع المستلم</b></div></div>
<div class="rc-f">أُعدّ بواسطة: ${E(u?u.full_name:'')} • تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div></div>`;
 document.body.appendChild(o);document.body.classList.add('rcp');const s=document.createElement('style');s.id='rcpg';s.textContent='@page{size:A4 portrait;margin:8mm}';document.head.appendChild(s);o.scrollTop=0}

// ===== كود الفاتورة التلقائي: E001 للدفع/الصرف، D001 للإيراد/الإيداع (قابل للتعديل) =====
async function nextInvCode(p){const L=await apiAll('invoices?select=code&code=ilike.'+p+'*'),re=new RegExp('^'+p+'(\\d+)$','i');let m=0;L.forEach(x=>{const r=re.exec(String(x.code||'').trim());if(r)m=Math.max(m,+r[1])});return p+String(m+1).padStart(3,'0')}
async function fillCode(el,p,force){if(!el||(!force&&el.value&&el.dataset.auto!='1'))return;try{el.value=await nextInvCode(p);el.dataset.auto='1'}catch(e){}}

// ===== تحويل جدول/تقرير (عنصر HTML) إلى PDF حقيقي بكل الصفوف (يتطلب html2canvas و jsPDF) =====
async function sheetToPdf(sel,n,name){try{msg('جارٍ إنشاء ملف PDF… قد يستغرق بعض الوقت للتقارير الكبيرة');await document.fonts.ready;
 const el=$(sel),id=el.id,land=n>6,W=land?1500:1000,fs=n>11?11:n>8?12:14,{jsPDF}=window.jspdf;
 const css=e=>{e.style.width=W+'px';e.style.overflow='visible';e.style.border='0';e.style.padding='16px';e.style.background='#fff';e.querySelectorAll('table').forEach(t=>{t.style.fontSize=fs+'px';t.style.width='100%'})};
 const m=el.cloneNode(true);m.removeAttribute('id');m.querySelectorAll('.noprint').forEach(e=>e.remove());m.style.position='absolute';m.style.left='-99999px';m.style.top='0';document.body.appendChild(m);css(m);
 const top=m.getBoundingClientRect().top,H=Math.ceil(m.scrollHeight),cuts=[...m.querySelectorAll('tr')].map(t=>t.getBoundingClientRect().bottom-top).filter(v=>v>0);document.body.removeChild(m);
 const pdf=new jsPDF({orientation:land?'l':'p',unit:'pt',format:'a4'}),pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),k=(pw-40)/W,pagePx=(ph-55)/k,rg=[];
 let y=0;while(y<H-1){const lim=y+pagePx;let end=H;if(lim<H){const c=cuts.filter(v=>v>y+40&&v<=lim);end=c.length?Math.max(...c):lim}rg.push([y,end]);y=end}
 for(let i=0;i<rg.length;i++){const [s,e2]=rg[i];msg(`جارٍ إنشاء ملف PDF… صفحة ${i+1} من ${rg.length}`);const sc=Math.min(2,Math.sqrt(12e6/(W*(e2-s))));
  const cv=await html2canvas(el,{scale:sc,backgroundColor:'#fff',windowWidth:W+60,windowHeight:H+300,y:s,height:e2-s,width:W,scrollX:0,scrollY:0,onclone:d=>{const x=d.getElementById(id);x.querySelectorAll('.noprint').forEach(e=>e.remove());css(x);x.style.position='absolute';x.style.left='0';x.style.top='0'}});
  if(i)pdf.addPage();pdf.addImage(cv.toDataURL('image/png'),'PNG',20,20,W*k,(e2-s)*k);cv.width=cv.height=0}
 for(let p=1;p<=rg.length;p++){pdf.setPage(p);pdf.setFontSize(9);pdf.text(p+' / '+rg.length,pw/2,ph-12,{align:'center'})}
 pdf.save(name);msg('تم تحميل ملف PDF ('+rg.length+' صفحة)')}catch(e){msg('تعذر إنشاء PDF: '+e.message+' — جرّب زر "طباعة" أو تحميل Excel',1)}}

// ===== تقرير حركة الخزينة / التحويلات (مشترك: رئيس المجلس + محاسب الخزينة) — يعرض المبالغ المنفَّذة فقط =====
const CRF=[['d','التاريخ'],['time','وقت التحصيل'],['k','النوع'],['name','الاسم'],['code','الكود'],['college','الكلية'],['level','المستوى'],['inv','كود الفاتورة / السريال'],['desc','البيان / نوع الإذن'],['contract','العقد'],['who','المحصِّل / المنفِّذ'],['amount','المبلغ'],['fee','رسوم التأخير'],['total','الإجمالي'],['note','ملاحظة']],CRD=['d','k','name','code','inv','desc','who','amount','fee','total'];
async function cashFetch(dest,a,b){
 let q='payments?status=eq.approved&select=amount,fee,note,created_at,invoices!inner(type,code,description,dest,suppliers(name,code,field,kind,level),contracts(title)),pc:users!payments_created_by_fkey(full_name)&invoices.dest=eq.'+dest+'&order=created_at.desc';
 if(a)q+='&created_at=gte.'+a+'T00:00:00Z';if(b)q+='&created_at=lte.'+b+'T23:59:59Z';
 return(await apiAll(q)).map(x=>{const v=x.invoices,s=v.suppliers||{},inc=v.type=='income',stu=s.kind=='student';let who='',time='',rest=[],mm;
  String(x.note||'').split(' • ').map(z=>z.trim()).filter(Boolean).forEach((z,i)=>{if(i==0&&(mm=z.match(/^المحص\S{1,3}ل\s*:\s*(.*)$/)))who=mm[1];else if(!time&&/^\d{1,2}:\d{2}$/.test(z))time=z;else rest.push(z)});
  return{d:x.created_at.slice(0,10),inc,k:inc?'إيراد':'مصروف',name:s.name||'',code:s.code||'',college:stu?(s.field||''):'',level:stu?(s.level||''):'',inv:v.code||'',desc:v.description||'',contract:v.contracts?.title||'',who:who||(x.pc?.full_name||''),time,amount:+x.amount,fee:+x.fee||0,total:rnd(+x.amount+(+x.fee||0)),note:rest.join(' • ')}})}
function cashWidget(box,cfg){
 const id=cfg.id,Sx={p:'day',rows:[],f:new Set(cfg.fields||CRD),a:'',b:'',tk:0},E=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),q=s=>box.querySelector('[data-r='+s+']');
 box.innerHTML=`<div class="card frm noprint"><h2>${cfg.title}</h2><small>${cfg.hint||''}</small>
<div class="tabs" data-r="p" style="flex-wrap:wrap;margin-top:10px"><button data-v="day" class="on">اليوم</button><button data-v="pday">يوم محدد</button><button data-v="month">شهر كامل</button><button data-v="range">فترة</button></div>
<div data-r="wd" class="hide"><label>اختر اليوم</label><input data-r="d1" type="date" value="${today()}"></div>
<div data-r="wm" class="hide"><label>اختر الشهر</label><input data-r="m1" type="month" value="${today().slice(0,7)}"></div>
<div data-r="wr" class="grid hide"><div><label>من</label><input data-r="r1" type="date" value="${today()}"></div><div><label>إلى</label><input data-r="r2" type="date" value="${today()}"></div></div>
${cfg.choose?`<details style="margin-top:10px"><summary>اختيار الحقول المراد إظهارها في التقرير</summary><div class="chk" data-r="f" style="margin-top:8px">${CRF.map(([k,l])=>`<label><input type="checkbox" data-k="${k}" ${Sx.f.has(k)?'checked':''}>${l}</label>`).join('')}</div></details>`:''}
<div class="grid"><button class="b" data-r="xl">تحميل Excel</button><button class="b g" data-r="pdf">تحميل PDF</button></div>${cfg.print?'<button class="b s" data-r="pr" style="margin-top:8px;background:#4a5f66">طباعة</button>':''}</div>
<div class="sheet" data-r="sh" id="${id}sh"></div>`;
 const sh=q('sh'),rng=()=>{const t=today();if(Sx.p=='day')return[t,t];if(Sx.p=='pday'){const v=q('d1').value;return[v,v]}if(Sx.p=='month'){const v=q('m1').value;return v?[v+'-01',v+'-'+String(new Date(+v.slice(0,4),+v.slice(5,7),0).getDate()).padStart(2,'0')]:['','']}return[q('r1').value,q('r2').value]};
 const sm=(l,k)=>rnd(l.reduce((s,r)=>s+r[k],0)),fl=()=>CRF.filter(([k])=>Sx.f.has(k));
 const fv=(r,k)=>k=='d'?fdu(r.d):k=='amount'||k=='total'?money(r[k]):k=='fee'?(r.fee?money(r.fee):''):E(r[k]);
 function paint(){const F=fl(),R=Sx.rows,inc=R.filter(r=>r.inc),out=R.filter(r=>!r.inc);
  sh.innerHTML=`<div class="sh"><img src="assets/logo.png" alt=""><div><b>${cfg.title}</b><br><small>${Sx.a==Sx.b?fdu(Sx.a):fdu(Sx.a)+' ← '+fdu(Sx.b)} • أعدّه: ${E(me().full_name)}</small></div></div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:10px 0"><div class="stat"><small>عدد الحركات</small><b>${R.length}</b></div><div class="stat"><small>إجمالي الإيراد (${inc.length})</small><b style="color:#237a4b">${money(sm(inc,'total'))}</b></div><div class="stat"><small>إجمالي المصروف (${out.length})</small><b style="color:#b3341f">${money(sm(out,'total'))}</b></div></div>`+
  (F.length?`<table><thead><tr>${F.map(([,l])=>`<th>${l}</th>`).join('')}</tr></thead><tbody>${R.map(r=>`<tr>${F.map(([k])=>`<td>${fv(r,k)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${F.length}">لا توجد حركات في هذه الفترة</td></tr>`}</tbody></table>`:'<div class="msg noprint">اختر حقلًا واحدًا على الأقل</div>')}
 async function run(){const [a,b]=rng(),tk=++Sx.tk;Sx.rows=[];if(!a||!b){sh.innerHTML='<div class="msg noprint">حدّد التاريخ</div>';return}sh.innerHTML='<div class="msg">جارٍ التحميل…</div>';
  try{const R=await cashFetch(cfg.dest,a,b);if(tk!=Sx.tk)return;Sx.rows=R;Sx.a=a;Sx.b=b;paint()}catch(e){if(tk==Sx.tk)sh.innerHTML='<div class="msg e">'+E(errT(e))+'</div>'}}
 q('p').querySelectorAll('button').forEach(bt=>bt.onclick=()=>{Sx.p=bt.dataset.v;q('p').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==bt));q('wd').classList.toggle('hide',Sx.p!='pday');q('wm').classList.toggle('hide',Sx.p!='month');q('wr').classList.toggle('hide',Sx.p!='range');run()});
 ['d1','m1','r1','r2'].forEach(k=>q(k).oninput=run);
 if(cfg.choose)q('f').querySelectorAll('input').forEach(c=>c.onchange=()=>{c.checked?Sx.f.add(c.dataset.k):Sx.f.delete(c.dataset.k);paint()});
 const nm=()=>(cfg.file||'report')+'_'+Sx.a+(Sx.b!=Sx.a?'_'+Sx.b:'');
 q('xl').onclick=()=>{const F=fl(),R=Sx.rows;if(!R.length)return msg('لا توجد بيانات لتحميلها',1);if(!F.length)return msg('اختر حقلًا واحدًا على الأقل',1);
  const rows=R.map(r=>{const o={};F.forEach(([k,l])=>o[l]=r[k]);return o}),tk=F.find(([k])=>k=='total')||F.find(([k])=>k=='amount')||F[F.length-1],c0=F[0][1];
  rows.push({});rows.push({[c0]:'إجمالي الإيراد',[tk[1]]:sm(R.filter(r=>r.inc),'total')});rows.push({[c0]:'إجمالي المصروف',[tk[1]]:sm(R.filter(r=>!r.inc),'total')});
  const ws=XLSX.utils.json_to_sheet(rows),wb=XLSX.utils.book_new();ws['!cols']=F.map(([k])=>({wch:k=='name'||k=='desc'||k=='contract'?30:k=='inv'||k=='college'?22:14}));wb.Workbook={Views:[{RTL:true}]};XLSX.utils.book_append_sheet(wb,ws,'التقرير');XLSX.writeFile(wb,nm()+'.xlsx');msg('تم تحميل ملف Excel ('+R.length+' حركة)')};
 q('pdf').onclick=()=>{if(!Sx.rows.length)return msg('لا توجد بيانات لتحميلها',1);if(!fl().length)return msg('اختر حقلًا واحدًا على الأقل',1);sheetToPdf('#'+id+'sh',fl().length,nm()+'.pdf')};
 if(cfg.print)q('pr').onclick=()=>{if(!Sx.rows.length)return msg('لا توجد بيانات للطباعة',1);let s=document.getElementById('pgc');if(!s){s=document.createElement('style');s.id='pgc';document.head.appendChild(s)}s.textContent='@page{size:A4 landscape;margin:8mm}@media print{.sheet table{font-size:9px}}';window.print()};
 run()}
