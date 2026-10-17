-- ============================================================
-- الإصدار 2: الخزينة + العقود الرئيسية والشهرية + غرامة التأخير + سجل التدقيق
-- قبل التشغيل: خذ نسخة احتياطية (Dashboard > Database > Backups أو صدّر الجداول CSV).
-- الملف آمن: لا يحذف بيانات، ويمكن تشغيله أكثر من مرة، وينفَّذ كاملًا أو يُلغى كاملًا.
-- ============================================================
begin;

-- 1) صلاحية جديدة: محاسب الخزينة
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check(role in('accountant','manager','chairman','admin','treasury'));

-- 2) العقد الرئيسي
alter table contracts add column if not exists description text;
alter table contracts add column if not exists start_date date;
alter table contracts add column if not exists end_date date;
alter table contracts add column if not exists late_rate numeric not null default 20;   -- غرامة التأخير % شهريًا
alter table contracts add column if not exists grace_day int not null default 10;       -- آخر يوم سماح من الشهر

-- 3) العقود الشهرية الفرعية
create table if not exists contract_months(
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts on delete cascade,
  month date not null,                       -- أول يوم في الشهر
  amount numeric,                            -- قيمة الشهر (اختيارية)
  created_by uuid references users,
  created_at timestamptz default now(),
  unique(contract_id,month));

-- 4) الفاتورة: ربط بالشهر + الجهة (حسابات / خزينة)
alter table invoices add column if not exists month_id uuid references contract_months on delete set null;
alter table invoices add column if not exists dest text not null default 'accounts';
alter table invoices drop constraint if exists invoices_dest_check;
alter table invoices add constraint invoices_dest_check check(dest in('accounts','treasury'));

-- 5) الدفعة/التحصيل: رسوم التأخير
alter table payments add column if not exists fee numeric not null default 0;
alter table payments add column if not exists fee_note text;
alter table payments add column if not exists note text;

-- 6) سجل التدقيق (إدخال وقراءة فقط: لا تعديل ولا حذف عبر الواجهة)
create table if not exists audit_log(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references users on delete set null,
  user_name text,
  action text not null,
  entity text, entity_id text, contract_id uuid,
  old_value jsonb, new_value jsonb, note text);

alter table contract_months enable row level security;
alter table audit_log enable row level security;
drop policy if exists cm_all on contract_months;
create policy cm_all on contract_months for all using(true) with check(true);
drop policy if exists al_ins on audit_log;
create policy al_ins on audit_log for insert with check(true);
drop policy if exists al_sel on audit_log;
create policy al_sel on audit_log for select using(true);

-- 7) ترحيل المعاملات الحالية حسب تواريخها (بلا حذف ولا تعديل لأي مبلغ)
update contracts c set
  start_date=s.mn, end_date=s.mx
from (
  select c2.id,
    (date_trunc('month', coalesce(min(i.created_at),c2.created_at) at time zone 'UTC'))::date as mn,
    (date_trunc('month', coalesce(max(i.created_at),c2.created_at) at time zone 'UTC') + interval '1 month' - interval '1 day')::date as mx
  from contracts c2 left join invoices i on i.contract_id=c2.id
  group by c2.id,c2.created_at) s
where c.id=s.id and c.start_date is null;

insert into contract_months(contract_id,month)
select distinct contract_id,(date_trunc('month',created_at at time zone 'UTC'))::date
from invoices where contract_id is not null
on conflict do nothing;

update invoices i set month_id=m.id
from contract_months m
where i.month_id is null and m.contract_id=i.contract_id
  and m.month=(date_trunc('month',i.created_at at time zone 'UTC'))::date;

commit;

-- للتحقق بعد التشغيل (يجب أن تكون النتيجة 0):
-- select count(*) from invoices where month_id is null and contract_id is not null;

notify pgrst, 'reload schema';
