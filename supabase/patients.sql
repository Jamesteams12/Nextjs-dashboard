create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  phone text,
  date_of_birth date,
  created_at timestamptz not null default now()
);

alter table public.patients enable row level security;

revoke all on table public.patients from anon, authenticated;
grant select, insert, update, delete on table public.patients to service_role;

create index patients_user_id_idx on public.patients (user_id);