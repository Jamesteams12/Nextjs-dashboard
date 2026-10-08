create unique index if not exists patients_id_user_id_idx
  on public.patients (id, user_id);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  patient_id uuid not null,
  starts_at timestamptz not null,
  status text not null default 'booked'
    check (status in ('booked', 'done', 'no_show')),
  created_at timestamptz not null default now(),
  constraint appointments_patient_owner_fkey
    foreign key (patient_id, user_id)
    references public.patients (id, user_id)
    on delete cascade
);

alter table public.appointments enable row level security;

revoke all on table public.appointments from anon, authenticated;
grant select, insert, update, delete on table public.appointments to service_role;

create index appointments_user_id_idx on public.appointments (user_id);
create index appointments_patient_id_idx on public.appointments (patient_id);
create index appointments_starts_at_idx on public.appointments (starts_at);
