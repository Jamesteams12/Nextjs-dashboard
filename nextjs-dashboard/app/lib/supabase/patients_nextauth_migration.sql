alter table public.patients
  drop constraint if exists patients_user_id_fkey;

alter table public.patients
  alter column user_id drop default;

drop policy if exists "patients: owner can select" on public.patients;
drop policy if exists "patients: owner can insert" on public.patients;
drop policy if exists "patients: owner can update" on public.patients;
drop policy if exists "patients: owner can delete" on public.patients;

alter table public.patients enable row level security;

revoke all on table public.patients from anon, authenticated;
grant select, insert, update, delete on table public.patients to service_role;
