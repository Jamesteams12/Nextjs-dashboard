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
