import { lusitana } from '@/app/ui/fonts';
import { fetchAppointments } from '@/app/lib/data';

function getUtcDayStart(dayOffset: number) {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset),
  );
}

export default async function Page() {
  const appointments = await fetchAppointments(getUtcDayStart(1), getUtcDayStart(2));

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-2xl`}>Tomorrow</h1>

      {appointments.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm ring-1 ring-gray-200">
          No appointments scheduled for tomorrow.
        </p>
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {appointment.patient_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.starts_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Phone:</span>{' '}
                  {appointment.patient_phone ?? 'Not provided'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
