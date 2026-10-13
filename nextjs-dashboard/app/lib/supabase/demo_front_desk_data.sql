begin;

do $$
begin
  if not exists (
    select 1
    from public.users
    where id = '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f'
      and role = 'front_desk'
  ) then
    raise exception 'Front Desk 1 is missing; create its public.users account first.';
  end if;

  if not exists (
    select 1
    from public.users
    where id = 'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23'
      and role = 'front_desk'
  ) then
    raise exception 'Front Desk 2 is missing; create its public.users account first.';
  end if;
end;
$$;

insert into public.patients (id, user_id, full_name, phone, date_of_birth, created_at)
values
  (
    'a16598ad-efec-4e1f-9e3a-7da95853ef61',
    '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f',
    'Avery Sample',
    null,
    '1988-04-12',
    now()
  ),
  (
    'b276a9be-f0fd-4f20-a04b-8eb06964f072',
    'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23',
    'Jordan Example',
    null,
    '1992-09-23',
    now()
  )
on conflict (id) do update
set user_id = excluded.user_id,
    full_name = excluded.full_name,
    phone = excluded.phone,
    date_of_birth = excluded.date_of_birth,
    created_at = excluded.created_at;

insert into public.appointments (id, user_id, patient_id, starts_at, status)
values
  (
    'c387bacf-102e-4031-b15c-9fc17a75a183',
    '6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f',
    'a16598ad-efec-4e1f-9e3a-7da95853ef61',
    now() + interval '1 day',
    'booked'
  ),
  (
    'd498cbdf-213f-4142-a26d-afd28b86b294',
    'aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23',
    'b276a9be-f0fd-4f20-a04b-8eb06964f072',
    now() + interval '2 days',
    'booked'
  )
on conflict (id) do update
set user_id = excluded.user_id,
    patient_id = excluded.patient_id,
    starts_at = excluded.starts_at,
    status = excluded.status;

commit;
