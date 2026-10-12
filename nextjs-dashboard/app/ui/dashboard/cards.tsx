import {
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchClinicMetrics } from '@/app/lib/data';

const iconMap = {
  patients: UserGroupIcon,
  appointments: CalendarDaysIcon,
  noShows: ExclamationTriangleIcon,
  tomorrow: ClockIcon,
};

export default async function CardWrapper() {
  const metrics = await fetchClinicMetrics();

  return (
    <>
      <Card title="New patients this month" value={metrics.newPatients} type="patients" />
      <Card title="Booked this week" value={metrics.bookedThisWeek} type="appointments" />
      <Card title="No-shows this month" value={metrics.noShowsThisMonth} type="noShows" />
      <Card title="Appointments tomorrow" value={metrics.tomorrow} type="tomorrow" />
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
