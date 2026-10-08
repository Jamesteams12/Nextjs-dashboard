create unique index if not exists patients_id_user_id_idx
  on public.patients (id, user_id);

update public.appointments AS appointment
set user_id = patient.user_id
from public.patients AS patient
where appointment.patient_id = patient.id
  and appointment.user_id is distinct from patient.user_id;

alter table public.appointments
  drop constraint if exists appointments_patient_id_fkey;

alter table public.appointments
  drop constraint if exists appointments_patient_owner_fkey;

alter table public.appointments
  add constraint appointments_patient_owner_fkey
  foreign key (patient_id, user_id)
  references public.patients (id, user_id)
  on delete cascade;

alter table public.appointments enable row level security;

drop policy if exists "appointments: owner can select" on public.appointments;
drop policy if exists "appointments: owner can insert" on public.appointments;
drop policy if exists "appointments: owner can update" on public.appointments;
drop policy if exists "appointments: owner can delete" on public.appointments;
drop policy if exists "appointments: insert own" on public.appointments;
drop policy if exists "appointments: update own" on public.appointments;

revoke all on table public.appointments from anon, authenticated;
grant select, insert, update, delete on table public.appointments to service_role;

create index if not exists appointments_user_id_idx on public.appointments (user_id);
create index if not exists appointments_patient_id_idx on public.appointments (patient_id);
create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
