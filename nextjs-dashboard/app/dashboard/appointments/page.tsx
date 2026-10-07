import { lusitana } from '@/app/ui/fonts';

const appointments = [
  { time: '08:30', patient: 'Ava Thompson', status: 'Booked', doctor: 'Dr. James' },
  { time: '09:15', patient: 'Noah Lee', status: 'Booked', doctor: 'Dr. James' },
  { time: '10:45', patient: 'Sofia Carter', status: 'Done', doctor: 'Dr. James' },
  { time: '13:00', patient: 'Liam Patel', status: 'Booked', doctor: 'Dr. James' },
  { time: '14:30', patient: 'Emma Singh', status: 'Booked', doctor: 'Dr. James' },
];

export default function Page() {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-2xl`}>Appointments</h1>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={`${appointment.patient}-${appointment.time}`} className="border-t border-gray-200">
                <td className="px-4 py-3 font-medium text-gray-900">{appointment.time}</td>
                <td className="px-4 py-3">{appointment.patient}</td>
                <td className="px-4 py-3">{appointment.doctor}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      appointment.status === 'Booked'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
