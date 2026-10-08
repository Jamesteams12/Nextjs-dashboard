'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { createCustomer, type CustomerState } from '@/app/lib/actions';

export default function Form() {
  const initialState: CustomerState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCustomer, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Customer name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            aria-describedby="name-error"
          />
          <div id="name-error" aria-live="polite">
            {state.errors?.name?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            aria-describedby="email-error"
          />
          <div id="email-error" aria-live="polite">
            {state.errors?.email?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>

        <div aria-live="polite">
          {state.message && (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create customer</Button>
      </div>
    </form>
  );
}
