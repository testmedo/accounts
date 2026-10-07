const SB='https://jupcllnvlaxsvfyoyisb.supabase.co',KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cGNsbG52bGF4c3ZmeW95aXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzUxOTcsImV4cCI6MjEwNjc1MTE5N30.wfjngx7XEfXz432ZpRNFiSMvcxNRdhotuvelmltEcLI';
async function api(path,method='GET',body,prefer='return=representation'){
 const r=await fetch(SB+'/rest/v1/'+path,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:prefer},body:body?JSON.stringify(body):undefined});
 const t=await r.text();if(!r.ok){const e=new Error(t);e.dup=/23505/.test(t);throw e}return t?JSON.parse(t):[]}
async function upload(file){
 const n=Date.now()+'_'+file.name.replace(/[^\w.]/g,'');
 const r=await fetch(`${SB}/storage/v1/object/photo/${n}`,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':file.type},body:file});
 if(!r.ok)throw new Error(await r.text());return `${SB}/storage/v1/object/public/photo/${n}`}
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const $=s=>document.querySelector(s);
const me=()=>JSON.parse(sessionStorage.getItem('u')||'null');
const money=n=>Number(n||0).toLocaleString('ar-EG',{maximumFractionDigits:2})+' ج.م';
const fdate=d=>new Date(d).toLocaleDateString('ar-EG');
const home={accountant:'accountant.html',manager:'approvals.html',chairman:'chairman.html',admin:'admin.html'};
const links={accountant:[['accountant.html','المحاسبة'],['report.html','كشف الحساب']],manager:[['approvals.html','الاعتمادات'],['accountant.html','المحاسبة'],['report.html','كشف الحساب'],['chairman.html','متابعة المورد']],chairman:[['chairman.html','متابعة المورد']],admin:[['admin.html','الرفع'],['users.html','الحسابات'],['manage.html','التعديل والحذف'],['report.html','التقارير'],['accountant.html','المحاسبة'],['approvals.html','الاعتمادات'],['chairman.html','متابعة المورد']]};
const IC={user:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6',folder:'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',receipt:'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',wallet:'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l3-3h12M16 14h2',list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',chart:'M3 3v18h18M7 15l4-4 3 3 5-6'};
const card=(ic,t,s,on)=>`<button class="ct" onclick="${on}"><span class="ci"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[ic]}"/></svg></span><span class="cx"><b>${t}</b><small>${s}</small></span><span class="cv">‹</span></button>`;
function guard(roles){const u=me();if(!u||!roles.includes(u.role)){location.href='index.html';return null}
 const cur=location.pathname.split('/').pop();
 document.body.insertAdjacentHTML('afterbegin',`<header><img src="assets/logo.png" alt="شعار الجامعة"><h1>${u.full_name}</h1><button onclick="sessionStorage.clear();location.href='index.html'">خروج</button></header>`+(links[u.role].length>1?`<nav>${links[u.role].map(l=>`<a href="${l[0]}" class="${l[0]==cur?'on':''}">${l[1]}</a>`).join('')}</nav>`:''));
 document.body.insertAdjacentHTML('beforeend','<footer><img src="assets/logo.png" alt=""><span>نظام متابعة مدفوعات الموردين والمقاولين</span></footer>');return u}
const paidOf=i=>(i.payments||[]).filter(p=>p.status=='approved').reduce((s,p)=>s+Number(p.amount),0);
const msg=(t,e)=>{const m=$('#msg');m.className='msg'+(e?' e':'');m.textContent=t;m.scrollIntoView({block:'center'})};

const nz=s=>String(s==null?'':s).trim().replace(/\s+/g,' ').toLowerCase();
const errT=e=>e.dup?'هذا السجل مكرر ولا يمكن إضافته أو حفظه':'خطأ: '+e.message;
