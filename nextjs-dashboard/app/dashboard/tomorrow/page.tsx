import { lusitana } from '@/app/ui/fonts';

const bookedTomorrow = [
  { time: '08:30', patient: 'Ava Thompson', phone: '(021) 555-0141' },
  { time: '09:15', patient: 'Noah Lee', phone: '(021) 555-0124' },
  { time: '10:45', patient: 'Emma Singh', phone: '(021) 555-0139' },
  { time: '13:00', patient: 'Liam Patel', phone: '(021) 555-0182' },
];

export default function Page() {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-2xl`}>Tomorrow</h1>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <ul className="space-y-4">
          {bookedTomorrow.map((appointment) => (
            <li
              key={`${appointment.patient}-${appointment.time}`}
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center"
            >
              <div>
                <p className="text-lg font-semibold text-gray-900">{appointment.patient}</p>
                <p className="text-sm text-gray-500">{appointment.time}</p>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Phone:</span> {appointment.phone}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
