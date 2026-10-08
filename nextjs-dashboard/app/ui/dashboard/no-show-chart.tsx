import { fetchAppointmentStatusCounts } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';

const statusLabels = {
  booked: { label: 'Booked', color: 'bg-emerald-500', hex: '#22c55e' },
  done: { label: 'Done', color: 'bg-sky-500', hex: '#3b82f6' },
  no_show: { label: 'No-show', color: 'bg-rose-500', hex: '#ef4444' },
} as const;

export default async function NoShowChart() {
  const statusCounts = await fetchAppointmentStatusCounts();
  const total = statusCounts.reduce((sum, item) => sum + item.count, 0);
  let currentPercent = 0;
  const stops = statusCounts.map(({ status, count }) => {
    const start = currentPercent;
    currentPercent += total === 0 ? 0 : (count / total) * 100;
    return `${statusLabels[status].hex} ${start}% ${currentPercent}%`;
  });
  const donutStyle = {
    background:
      total === 0
        ? '#e5e7eb'
        : `conic-gradient(${stops.join(', ')})`,
  };
  const noShowCount = statusCounts.find((item) => item.status === 'no_show')?.count ?? 0;
  const noShowPercent = total === 0 ? 0 : Math.round((noShowCount / total) * 100);

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Appointment outcomes this month
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-6 rounded-md bg-white p-6 md:flex-row md:justify-between">
          <div
            className="relative h-40 w-40 rounded-full shadow-inner"
            style={donutStyle}
            role="img"
            aria-label={`Appointment outcomes. ${noShowCount} no-shows out of ${total} appointments this month.`}
          >
            <div className="absolute inset-4 rounded-full bg-white" />
            <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">
              {noShowPercent}% no-show
            </div>
          </div>

          <div className="w-full max-w-xs space-y-3">
            {statusCounts.map(({ status, count }) => {
              const percent = total === 0 ? 0 : Math.round((count / total) * 100);
              return (
                <div key={status} className="flex items-center justify-between gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${statusLabels[status].color}`} />
                    <span>{statusLabels[status].label}</span>
                  </div>
                  <span className="font-medium">{count} ({percent}%)</span>
                </div>
              );
            })}
            {total === 0 && (
              <p className="text-sm text-gray-500">No appointments recorded this month.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
