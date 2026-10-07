import {
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  patients: UserGroupIcon,
  appointments: CalendarDaysIcon,
  noShows: ExclamationTriangleIcon,
  tomorrow: ClockIcon,
};

const clinicMetrics = {
  patients: { title: 'New patients', value: 16 },
  appointments: { title: 'Booked this week', value: 42 },
  noShows: { title: 'No-shows', value: '6%' },
  tomorrow: { title: 'Tomorrow', value: 9 },
};

export default async function CardWrapper() {
  return (
    <>
      <Card title={clinicMetrics.patients.title} value={clinicMetrics.patients.value} type="patients" />
      <Card title={clinicMetrics.appointments.title} value={clinicMetrics.appointments.value} type="appointments" />
      <Card title={clinicMetrics.noShows.title} value={clinicMetrics.noShows.value} type="noShows" />
      <Card title={clinicMetrics.tomorrow.title} value={clinicMetrics.tomorrow.value} type="tomorrow" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'patients' | 'appointments' | 'noShows' | 'tomorrow';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
