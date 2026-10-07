'use client';

import {
  CalendarDaysIcon,
  ClockIcon,
  HomeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Patients', href: '/dashboard/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDaysIcon },
  { name: 'Tomorrow', href: '/dashboard/tomorrow', icon: ClockIcon },
];

export default function NavLinks({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {links.filter((link) => isOwner || link.href !== '/dashboard').map((link) => {
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
