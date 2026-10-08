import { lusitana } from '@/app/ui/fonts';
import { fetchAppointments } from '@/app/lib/data';

function formatStatus(status: string) {
  return status
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function Page() {
  const appointments = await fetchAppointments(new Date(), new Date('9999-12-31'));

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-2xl`}>Appointments</h1>

      {appointments.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm ring-1 ring-gray-200">
          No upcoming appointments.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Date and time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-gray-200">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {new Date(appointment.starts_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{appointment.patient_name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {formatStatus(appointment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
