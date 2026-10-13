## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Customer and invoice ownership

Before deploying this version, apply
[`20261008000000_add_customer_invoice_ownership.sql`](./supabase/migrations/20261008000000_add_customer_invoice_ownership.sql)
to the database. Existing customers and invoices are assigned to the
`owner@nextmail.com` account; new records are scoped to their creating owner.
The migration requires the existing `users`, `customers`, and `invoices`
tables.

The development seed endpoint is available only as `POST /seed` when running
with `NODE_ENV=development`. It is disabled in production.

## Clinic patient access

Patient `user_id` values are the IDs from the application's PostgreSQL `users`
table, which are also carried in the NextAuth session. Front-desk accounts can
see and update patients and appointments created under their own user ID. The
owner can see and manage all clinic patients and appointments; patients created
by the owner are stored under the owner's ID.

The demo accounts seeded by `POST /seed` are:

| Role | Email | Password | User ID |
| --- | --- | --- | --- |
| Owner | `owner@nextmail.com` | `123456` | `410544b2-4001-4271-9855-fec4b6a6442a` |
| Front desk | `frontdesk@nextmail.com` | `frontdesk123` | `6f26a2d8-3f8d-44a9-9d52-3d7f4b0d7c7f` |
| Front desk | `frontdesk2@nextmail.com` | `frontdesk456` | `aa6ff0e4-5a6d-47f8-9c1a-7c8ddc1e9a23` |

This app uses NextAuth credentials, not Supabase Auth. Consequently
`auth.uid()` is not the login's user ID here (and is null for SQL Editor
queries). Server-side Supabase calls use the service-role key, so row access is
scoped by the authenticated NextAuth user ID in the server queries/actions.
Existing patients retain their current `user_id`; records previously assigned
to the owner cannot be attributed to a front-desk account automatically.

To add a repeatable sample patient and upcoming appointment to each front-desk
account, run
[`demo_front_desk_data.sql`](./app/lib/supabase/demo_front_desk_data.sql) in the
Supabase SQL Editor after both accounts exist in `public.users`. Each front-desk
login will see its own sample patient and appointment; the owner can see both.
