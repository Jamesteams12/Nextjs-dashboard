import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { fetchCustomers } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
        <Link
          href="/dashboard/customers/create"
          className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        >
          <span>Create customer</span>
          <PlusIcon className="h-5 w-5" />
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No customers yet. Add the first one to create an invoice.
        </p>
      ) : (
        <table className="mt-6 min-w-full text-left text-sm text-gray-900">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b">
                <td className="px-4 py-3">{customer.name}</td>
                <td className="px-4 py-3">{customer.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
