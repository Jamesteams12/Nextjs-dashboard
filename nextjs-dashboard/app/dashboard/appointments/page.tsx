import { fetchAppointments, fetchPatientOptions } from '@/app/lib/data';
import AppointmentRow from '@/app/ui/appointments/appointment-row';
import CreateAppointmentForm from '@/app/ui/appointments/create-form';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const appointments = await fetchAppointments(new Date(), new Date('9999-12-31'));
  const patients = await fetchPatientOptions();

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-2xl`}>Appointments</h1>
      <CreateAppointmentForm patients={patients} />

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
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <AppointmentRow key={appointment.id} appointment={appointment} patients={patients} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
