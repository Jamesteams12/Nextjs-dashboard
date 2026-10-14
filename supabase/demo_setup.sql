-- Run POST /seed in development first so the demo staff accounts exist in public.users.
-- Then run this script in the Supabase SQL Editor. It is safe to rerun.

begin;

do $$
begin
  if to_regclass('public.users') is null then
    raise exception 'public.users is missing; run POST /seed in development first.';
  end if;

  if not exists (
    select 1 from public.users
    where id = '410544b2-4001-4271-9855-fec4b6a6442a'
      and role = 'owner'
  ) then
    raise exception 'The demo owner account is missing; run POST /seed first.';
  end if;

  if not exists (
    select 1 from public.users
    where id = '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f'
      and role = 'front_desk'
  ) then
    raise exception 'The first demo front-desk account is missing; run POST /seed first.';
  end if;

  if not exists (
    select 1 from public.users
    where id = 'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23'
      and role = 'front_desk'
  ) then
    raise exception 'The second demo front-desk account is missing; run POST /seed first.';
  end if;
end;
$$;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  phone text,
  date_of_birth date,
  created_at timestamptz not null default now()
);

alter table public.patients
  alter column user_id drop default;

create unique index if not exists patients_id_user_id_idx
  on public.patients (id, user_id);
create index if not exists patients_user_id_idx
  on public.patients (user_id);

create table if not exists public.doctors (
  id uuid primary key,
  full_name text not null
);

alter table public.doctors enable row level security;

revoke all on table public.doctors from anon, authenticated;
grant select on table public.doctors to service_role;

insert into public.doctors (id, full_name)
values
  ('d0c70000-0000-4000-8000-000000000001', 'Dr. Maya Patel'),
  ('d0c70000-0000-4000-8000-000000000002', 'Dr. Liam Nkosi')
on conflict (id) do update
set full_name = excluded.full_name;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  patient_id uuid not null,
  doctor_id uuid,
  starts_at timestamptz not null,
  status text not null default 'booked'
    check (status in ('booked', 'done', 'no_show')),
  created_at timestamptz not null default now()
);

alter table public.appointments
  add column if not exists user_id uuid;

alter table public.appointments
  add column if not exists doctor_id uuid;

alter table public.appointments
  drop constraint if exists appointments_patient_id_fkey;
alter table public.appointments
  drop constraint if exists appointments_patient_owner_fkey;

do $$
begin
  if exists (
    select 1
    from public.appointments as appointment
    left join public.patients as patient on patient.id = appointment.patient_id
    where patient.id is null
  ) then
    raise exception 'An appointment references a missing patient; repair it before running this script.';
  end if;
end;
$$;

update public.appointments as appointment
set user_id = patient.user_id
from public.patients as patient
where appointment.patient_id = patient.id
  and appointment.user_id is distinct from patient.user_id;

update public.appointments
set doctor_id = 'd0c70000-0000-4000-8000-000000000001'
where doctor_id is null;

alter table public.appointments
  alter column user_id set not null;
alter table public.appointments
  alter column doctor_id set not null;

alter table public.appointments
  add constraint appointments_patient_owner_fkey
  foreign key (patient_id, user_id)
  references public.patients (id, user_id)
  on delete cascade;

alter table public.appointments
  drop constraint if exists appointments_doctor_id_fkey;
alter table public.appointments
  add constraint appointments_doctor_id_fkey
  foreign key (doctor_id)
  references public.doctors (id);

alter table public.patients enable row level security;
alter table public.appointments enable row level security;

revoke all on table public.patients from anon, authenticated;
revoke all on table public.appointments from anon, authenticated;
grant select, insert, update, delete on table public.patients to service_role;
grant select, insert, update, delete on table public.appointments to service_role;

create index if not exists appointments_user_id_idx
  on public.appointments (user_id);
create index if not exists appointments_patient_id_idx
  on public.appointments (patient_id);
create index if not exists appointments_doctor_id_idx
  on public.appointments (doctor_id);
create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at);

insert into public.patients (id, user_id, full_name, phone, date_of_birth, created_at)
values
  (
    'e1547a44-c78a-4c1c-87a8-0169fdf8cd01',
    '410544b2-4001-4271-9855-fec4b6a6442a',
    'Alex Morgan',
    '+27 11 555 0101',
    '1985-06-14',
    date_trunc('month', now()) - interval '5 months' + interval '10 days'
  ),
  (
    'a16598ad-efec-4e1f-9e3a-7da95853ef61',
    '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f',
    'Avery Sample',
    '+27 11 555 0102',
    '1988-04-12',
    date_trunc('month', now()) - interval '4 months' + interval '10 days'
  ),
  (
    'e2658b55-e87a-4de5-9694-a6a5f2ea0830',
    '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f',
    'Mia Patel',
    '+27 11 555 0103',
    '1994-02-08',
    date_trunc('month', now()) - interval '2 months' + interval '10 days'
  ),
  (
    'e3769c66-f98b-4ef6-a705-b7b603fb1941',
    'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23',
    'Jordan Example',
    '+27 11 555 0104',
    '1992-09-23',
    date_trunc('month', now()) - interval '3 months' + interval '10 days'
  ),
  (
    'e487ad77-a09c-4f07-b816-c8c7140c2a52',
    'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23',
    'Taylor Lee',
    '+27 11 555 0105',
    '2001-11-30',
    date_trunc('month', now()) - interval '1 month' + interval '10 days'
  ),
  (
    'e598be88-b1ad-4018-c927-d9d8251d3b63',
    '410544b2-4001-4271-9855-fec4b6a6442a',
    'Sam Rivera',
    '+27 11 555 0106',
    '1979-03-21',
    date_trunc('month', now()) + interval '10 days'
  )
on conflict (id) do update
set user_id = excluded.user_id,
    full_name = excluded.full_name,
    phone = excluded.phone,
    date_of_birth = excluded.date_of_birth,
    created_at = excluded.created_at;

insert into public.appointments (id, user_id, patient_id, doctor_id, starts_at, status)
values
  (
    'f1a19c11-2d4e-4b66-8d3e-76c00e1a0001',
    '410544b2-4001-4271-9855-fec4b6a6442a',
    'e1547a44-c78a-4c1c-87a8-0169fdf8cd01',
    'd0c70000-0000-4000-8000-000000000001',
    now() - interval '4 days',
    'done'
  ),
  (
    'f1a19c11-2d4e-4b66-8d3e-76c00e1a0002',
    '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f',
    'a16598ad-efec-4e1f-9e3a-7da95853ef61',
    'd0c70000-0000-4000-8000-000000000002',
    now() - interval '2 days',
    'no_show'
  ),
  (
    'f1a19c11-2d4e-4b66-8d3e-76c00e1a0003',
    'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23',
    'e3769c66-f98b-4ef6-a705-b7b603fb1941',
    'd0c70000-0000-4000-8000-000000000001',
    now() + interval '3 days',
    'booked'
  ),
  (
    'f1a19c11-2d4e-4b66-8d3e-76c00e1a0004',
    '410544b2-4001-4271-9855-fec4b6a6442a',
    'e598be88-b1ad-4018-c927-d9d8251d3b63',
    'd0c70000-0000-4000-8000-000000000002',
    (date_trunc('day', now() at time zone 'Africa/Johannesburg')
      + interval '1 day 9 hours') at time zone 'Africa/Johannesburg',
    'booked'
  ),
  (
    'f1a19c11-2d4e-4b66-8d3e-76c00e1a0005',
    '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f',
    'e2658b55-e87a-4de5-9694-a6a5f2ea0830',
    'd0c70000-0000-4000-8000-000000000001',
    (date_trunc('day', now() at time zone 'Africa/Johannesburg')
      + interval '1 day 10 hours') at time zone 'Africa/Johannesburg',
    'booked'
  ),
  (
    'f1a19c11-2d4e-4b66-8d3e-76c00e1a0006',
    'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23',
    'e487ad77-a09c-4f07-b816-c8c7140c2a52',
    'd0c70000-0000-4000-8000-000000000002',
    (date_trunc('day', now() at time zone 'Africa/Johannesburg')
      + interval '1 day 11 hours') at time zone 'Africa/Johannesburg',
    'booked'
  )
on conflict (id) do update
set user_id = excluded.user_id,
    patient_id = excluded.patient_id,
    doctor_id = excluded.doctor_id,
    starts_at = excluded.starts_at,
    status = excluded.status;

commit;
