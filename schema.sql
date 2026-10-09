-- شغّله في Supabase > SQL Editor
create table users(id uuid primary key default gen_random_uuid(),username text unique not null,password text not null,full_name text not null,role text not null check(role in('accountant','manager','chairman','admin')),active bool default true);
create table suppliers(id uuid primary key default gen_random_uuid(),code text unique not null,name text not null,phone text,field text,created_at timestamptz default now());
create table contracts(id uuid primary key default gen_random_uuid(),supplier_id uuid references suppliers on delete cascade,title text not null,agreed_amount numeric,created_by uuid references users,created_at timestamptz default now());
create table invoices(id uuid primary key default gen_random_uuid(),contract_id uuid references contracts on delete cascade,supplier_id uuid references suppliers on delete cascade,type text not null check(type in('pay','income','bill')),code text,amount numeric not null,description text,image_url text,created_by uuid references users,created_at timestamptz default now());
create table payments(id uuid primary key default gen_random_uuid(),invoice_id uuid references invoices on delete cascade,amount numeric not null,status text default 'pending' check(status in('pending','approved','rejected')),created_by uuid references users,approved_by uuid references users,created_at timestamptz default now(),decided_at timestamptz);
-- تنبيه: السياسات التالية مفتوحة لأن الدخول مخصص (anon key). للإنتاج استخدم Supabase Auth + RLS صارمة.
alter table users enable row level security;alter table suppliers enable row level security;alter table contracts enable row level security;alter table invoices enable row level security;alter table payments enable row level security;
create policy a on users for all using(true) with check(true);create policy a on suppliers for all using(true) with check(true);create policy a on contracts for all using(true) with check(true);create policy a on invoices for all using(true) with check(true);create policy a on payments for all using(true) with check(true);
insert into users(username,password,full_name,role) values
('admin','admin123','مدير النظام','admin'),
('manager','manager123','مدير الحسابات','manager'),
('chairman','chair123','رئيس مجلس الأمناء','chairman'),
('acc1','acc123','المحاسب الأول','accountant');
-- صور الفواتير: اجعل الـ bucket باسم photo عامًا (Public) ثم:
create policy photo_ins on storage.objects for insert to anon with check(bucket_id='photo');
create policy photo_sel on storage.objects for select to anon using(bucket_id='photo');

-- منع التكرار على مستوى قاعدة البيانات
create unique index if not exists inv_code_u on invoices(lower(trim(code))) where code is not null and trim(code)<>'';
create unique index if not exists con_u on contracts(supplier_id,lower(trim(title)));

-- إضافة نوع "فاتورة" لقاعدة بيانات قائمة:
alter table invoices drop constraint if exists invoices_type_check;
alter table invoices add constraint invoices_type_check check(type in('pay','income','bill'));
