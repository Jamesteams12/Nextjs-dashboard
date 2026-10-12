ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS user_id UUID;

UPDATE public.customers
SET user_id = (
  SELECT id
  FROM public.users
  WHERE email = 'owner@nextmail.com'
)
WHERE user_id IS NULL;

UPDATE public.invoices AS invoice
SET user_id = customer.user_id
FROM public.customers AS customer
WHERE invoice.customer_id = customer.id
  AND invoice.user_id IS NULL;

UPDATE public.invoices
SET user_id = (
  SELECT id
  FROM public.users
  WHERE email = 'owner@nextmail.com'
)
WHERE user_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'Could not assign existing customers to an owner account.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.invoices WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'Could not assign existing invoices to an owner account.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    LEFT JOIN public.customers AS customer
      ON customer.id = invoice.customer_id
    WHERE customer.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invoices reference customers that do not exist.';
  END IF;
END
$$;

ALTER TABLE public.customers
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.invoices
  ALTER COLUMN user_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS customers_id_user_id_key
  ON public.customers (id, user_id);

CREATE INDEX IF NOT EXISTS customers_user_id_idx
  ON public.customers (user_id);

CREATE INDEX IF NOT EXISTS invoices_user_id_idx
  ON public.invoices (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_user_id_fkey'
      AND conrelid = 'public.customers'::regclass
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invoices_user_id_fkey'
      AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invoices_customer_owner_fkey'
      AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_customer_owner_fkey
      FOREIGN KEY (customer_id, user_id)
      REFERENCES public.customers (id, user_id);
  END IF;
END
$$;
