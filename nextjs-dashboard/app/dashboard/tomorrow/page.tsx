import Link from 'next/link';
import { fetchAppointments } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const appointments = await fetchAppointments();
  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(todayParts.find((part) => part.type === 'year')?.value);
  const month = Number(todayParts.find((part) => part.type === 'month')?.value);
  const day = Number(todayParts.find((part) => part.type === 'day')?.value);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  const tomorrowAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Johannesburg',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(appointment.starts_at));
    return appointmentDate === tomorrow && appointment.status === 'booked';
  });

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-2xl`}>Tomorrow</h1>

      {tomorrowAppointments.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm ring-1 ring-gray-200">
          No booked appointments for tomorrow.{' '}
          <Link href="/dashboard/appointments" className="text-blue-700 underline">
            View appointments
          </Link>
        </p>
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <ul className="space-y-4">
            {tomorrowAppointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">{appointment.patient_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Intl.DateTimeFormat('en-ZA', {
                      timeStyle: 'short',
                      timeZone: 'Africa/Johannesburg',
                    }).format(new Date(appointment.starts_at))}
                  </p>
                </div>
                {appointment.patient_phone && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Phone:</span> {appointment.patient_phone}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
