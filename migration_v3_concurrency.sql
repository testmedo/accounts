-- ============================================================
-- حماية من التحصيل/الصرف المزدوج عند عمل أكثر من شخص على الخزينة معًا
-- يمنع في قاعدة البيانات نفسها أن يتجاوز مجموع المعتمد من الدفعات مبلغ الفاتورة،
-- حتى لو ضغط شخصان "تحصيل" على نفس الفاتورة في نفس اللحظة (يُقفل صف الفاتورة أثناء الفحص).
-- شغّله مرة واحدة بعد migration_v2.sql. آمن ويمكن إعادة تشغيله.
-- ============================================================
create or replace function check_payment_total() returns trigger language plpgsql as $$
declare inv_amount numeric; total numeric;
begin
  if new.status = 'approved' then
    select amount into inv_amount from invoices where id = new.invoice_id for update;
    select coalesce(sum(amount),0) into total from payments
      where invoice_id = new.invoice_id and status = 'approved' and id is distinct from new.id;
    if total + new.amount > inv_amount + 0.005 then
      raise exception 'تجاوز مبلغ الفاتورة: تم تحصيل أو دفع جزء منها بالفعل من شاشة أخرى، حدّث الصفحة' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists payments_total_chk on payments;
create trigger payments_total_chk before insert or update of amount, status on payments
  for each row execute function check_payment_total();

notify pgrst, 'reload schema';
