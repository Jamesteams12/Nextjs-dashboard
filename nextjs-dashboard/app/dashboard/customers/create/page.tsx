import Link from 'next/link';
import Form from '@/app/ui/customers/create-form';
import { lusitana } from '@/app/ui/fonts';

export default function Page() {
  return (
    <main>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex gap-2 text-sm text-gray-600">
          <li>
            <Link href="/dashboard/customers" className="hover:text-blue-600">
              Customers
            </Link>
            <span className="ml-2">/</span>
          </li>
          <li aria-current="page">Create customer</li>
        </ol>
      </nav>
      <h1 className={`${lusitana.className} mb-6 text-2xl`}>Create customer</h1>
      <Form />
    </main>
  );
}
