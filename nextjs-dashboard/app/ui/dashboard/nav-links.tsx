'use client';

import {
  CalendarDaysIcon,
  ClockIcon,
  HomeIcon,
  BanknotesIcon,
  UserGroupIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon, ownerOnly: true },
  { name: 'Patients', href: '/dashboard/patients', icon: UserGroupIcon, ownerOnly: false },
  { name: 'Customers', href: '/dashboard/customers', icon: UserCircleIcon, ownerOnly: true },
  { name: 'Invoices', href: '/dashboard/invoices', icon: BanknotesIcon, ownerOnly: true },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDaysIcon, ownerOnly: false },
  { name: 'Tomorrow', href: '/dashboard/tomorrow', icon: ClockIcon, ownerOnly: false },
];

export default function NavLinks({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {links.filter((link) => !link.ownerOnly || isOwner).map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
