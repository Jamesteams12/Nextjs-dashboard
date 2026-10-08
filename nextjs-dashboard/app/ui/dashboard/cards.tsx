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
      <Card title="Patients" value={metrics.patients} type="patients" />
      <Card title="Appointments this week" value={metrics.appointmentsThisWeek} type="appointments" />
      <Card title="No-show rate this month" value={`${metrics.noShowRateThisMonth}%`} type="noShows" />
      <Card title="Booked for tomorrow" value={metrics.appointmentsTomorrow} type="tomorrow" />
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
