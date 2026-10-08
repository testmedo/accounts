const HD=['كود المورد','الاسم','الهاتف','المجال','العقد','كود الفاتورة','النوع','المبلغ','المدفوع','البيان','التاريخ'];
const AM={'يناير':1,'فبراير':2,'مارس':3,'ابريل':4,'أبريل':4,'مايو':5,'يونيو':6,'يوليو':7,'اغسطس':8,'أغسطس':8,'سبتمبر':9,'اكتوبر':10,'أكتوبر':10,'نوفمبر':11,'ديسمبر':12,'january':1,'february':2,'march':3,'april':4,'may':5,'june':6,'july':7,'august':8,'september':9,'october':10,'november':11,'december':12,'jan':1,'feb':2,'mar':3,'apr':4,'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12};
const mk=(y,m,d)=>{const x=new Date(y,m-1,d,12);return x.getMonth()==m-1&&x.getDate()==d?x:undefined};
// يرجع: null (فارغ) | undefined (غير مفهوم) | Date
function parseDate(v){if(v==null||v==='')return null;
 if(v instanceof Date)return isNaN(v)?undefined:new Date(v.getFullYear(),v.getMonth(),v.getDate(),12);
 if(typeof v==='number'){if(v>20000&&v<80000){const d=new Date(Math.round((v-25569)*864e5));return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),12)}return undefined}
 const s=String(v).trim().replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776);if(!s)return null;
 let m=s.match(/^(\d{4})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/);if(m)return mk(+m[1],+m[2],+m[3]);
 m=s.match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})/);if(m){let y=+m[3],d=+m[1],mo=+m[2];if(y<100)y+=2000;if(mo>12&&d<=12)[d,mo]=[mo,d];return mk(y,mo,d)}
 const low=s.toLowerCase(),nums=low.match(/\d+/g)||[];
 for(const [k,n] of Object.entries(AM))if(low.includes(k)&&nums.length>=2){let d=+nums[0],y=+nums[1];if(nums[0].length==4){y=+nums[0];d=+nums[1]}if(y<100)y+=2000;return mk(y,n,d)}
 const p=new Date(s);return isNaN(p)?undefined:new Date(p.getFullYear(),p.getMonth(),p.getDate(),12)}
function tpl(){const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,XLSX.utils.aoa_to_sheet([HD]),'data');XLSX.writeFile(w,'نموذج_الاستيراد.xlsx')}
async function importXlsx(f,U,status){try{if(!f)return msg('اختر ملفًا',1);
const wb=XLSX.read(await f.arrayBuffer(),{cellDates:true}),rows=XLSX.utils.sheet_to_json(wb.Sheets.data||wb.Sheets[wb.SheetNames[0]]);msg('جارٍ الاستيراد...');
const [S,C,I]=await Promise.all([api('suppliers?select=id,code,name'),api('contracts?select=id,supplier_id,title'),api('invoices?select=code')]);
const sup={},sn={},con={},old=new Set(I.map(i=>nz(i.code)).filter(Boolean)),seen=new Set();S.forEach(s=>{sup[nz(s.code)]=s.id;sn[nz(s.name)]=s.id});C.forEach(c=>con[c.supplier_id+'|'+nz(c.title)]=c.id);
let n=0;const dup=[],bad=[],ap=status=='approved';
for(const [ix,r] of rows.entries()){const L='سطر '+(ix+2),g=h=>r[h]==null?'':String(r[h]).trim(),sc=g(HD[0]),ic=g(HD[5]),amt=+r[HD[7]],paid=+r[HD[8]]||0;
 if(!sc||!ic||!(amt>0)){bad.push(`${L}: بيانات ناقصة (كود المورد أو كود الفاتورة أو المبلغ)`);continue}
 if(paid>amt){bad.push(`${L}: المدفوع أكبر من مبلغ الفاتورة (${ic})`);continue}
 const dt=parseDate(r[HD[10]]);if(dt===undefined){bad.push(`${L}: التاريخ غير مفهوم (${r[HD[10]]}) — الفاتورة ${ic}`);continue}
 const k=nz(ic);if(old.has(k)){dup.push(`${L}: الفاتورة ${ic} — موجودة مسبقًا في النظام`);continue}if(seen.has(k)){dup.push(`${L}: الفاتورة ${ic} — مكررة داخل الملف`);continue}
 try{let sid=sup[nz(sc)]||sn[nz(g(HD[1]))];if(!sid){sid=(await api('suppliers','POST',{code:sc,name:g(HD[1])||sc,phone:g(HD[2]),field:g(HD[3])}))[0].id;sup[nz(sc)]=sid;sn[nz(g(HD[1]))]=sid}
 const t=g(HD[4])||'عقد سابق',ck=sid+'|'+nz(t);if(!con[ck])con[ck]=(await api('contracts','POST',{supplier_id:sid,title:t,created_by:U.id}))[0].id;
 const at=(dt||new Date()).toISOString();
 const inv=(await api('invoices','POST',{contract_id:con[ck],supplier_id:sid,type:g(HD[6])=='income'?'income':'pay',code:ic,amount:amt,description:g(HD[9]),created_by:U.id,created_at:at}))[0];seen.add(k);
 if(paid>0)await api('payments','POST',ap?{invoice_id:inv.id,amount:paid,status:'approved',created_by:U.id,approved_by:U.id,created_at:at,decided_at:at}:{invoice_id:inv.id,amount:paid,created_by:U.id,created_at:at});n++}catch(x){bad.push(`${L}: ${errT(x)}`)}}
const ul=a=>`<ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
$('#res').innerHTML=`<div class="card"><h2>نتيجة الاستيراد</h2><div class="msg">تم رفع ${n} فاتورة جديدة${ap?'':' — المدفوعات بانتظار اعتماد مدير الحسابات'}</div>${dup.length?`<div class="msg e"><b>لم تُرفع (${dup.length}) فاتورة مكررة:</b>${ul(dup)}</div>`:''}${bad.length?`<div class="msg e"><b>لم تُرفع (${bad.length}) سطر لوجود مشكلة:</b>${ul(bad)}</div>`:''}</div>`;
msg(`انتهى الاستيراد: ${n} مرفوعة، ${dup.length} مكررة، ${bad.length} بها مشكلة`);if(window.load)load()}catch(e){msg(errT(e),1)}}
