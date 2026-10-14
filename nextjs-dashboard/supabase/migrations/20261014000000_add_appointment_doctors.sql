begin;

create table if not exists public.doctors (
  id uuid primary key,
  full_name text not null
);

insert into public.doctors (id, full_name)
values
  ('d0c70000-0000-4000-8000-000000000001', 'Dr. Maya Patel'),
  ('d0c70000-0000-4000-8000-000000000002', 'Dr. Liam Nkosi')
on conflict (id) do update
set full_name = excluded.full_name;

alter table public.appointments
  add column if not exists doctor_id uuid;

update public.appointments
set doctor_id = 'd0c70000-0000-4000-8000-000000000001'
where doctor_id is null;

alter table public.appointments
  alter column doctor_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_doctor_id_fkey'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_doctor_id_fkey
      foreign key (doctor_id)
      references public.doctors (id);
  end if;
end;
$$;

alter table public.doctors enable row level security;

revoke all on table public.doctors from anon, authenticated;
grant select on table public.doctors to service_role;

create index if not exists appointments_doctor_id_idx
  on public.appointments (doctor_id);

commit;
