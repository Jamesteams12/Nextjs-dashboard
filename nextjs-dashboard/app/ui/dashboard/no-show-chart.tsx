import { lusitana } from '@/app/ui/fonts';
import { fetchAppointmentStatusSummary } from '@/app/lib/data';

const statusStyles = [
  { key: 'booked', label: 'Booked', color: '#22c55e', dot: 'bg-emerald-500' },
  { key: 'done', label: 'Done', color: '#3b82f6', dot: 'bg-sky-500' },
  { key: 'noShow', label: 'No-show', color: '#ef4444', dot: 'bg-rose-500' },
  { key: 'other', label: 'Other', color: '#9ca3af', dot: 'bg-gray-400' },
] as const;

function formatPercent(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export default async function NoShowChart() {
  const summary = await fetchAppointmentStatusSummary();
  const total = summary.booked + summary.done + summary.noShow + summary.other;
  const noShowPercent = total === 0 ? 0 : (summary.noShow / total) * 100;
  let percentSoFar = 0;
  const stops = statusStyles.map((status) => {
    const start = percentSoFar;
    percentSoFar += total === 0 ? 0 : (summary[status.key] / total) * 100;
    return `${status.color} ${start}% ${percentSoFar}%`;
  });
  const donutStyle = {
    background:
      total === 0
        ? '#e5e7eb'
        : `conic-gradient(${stops.join(', ')})`,
  };

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        What share of this month&apos;s appointments were no-shows?
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-6 rounded-md bg-white p-6 md:flex-row md:justify-between">
          <div
            className="relative h-40 w-40 shrink-0 rounded-full shadow-inner"
            style={donutStyle}
            role="img"
            aria-label={`${summary.noShow} no-shows out of ${total} appointments this month`}
          >
            <div className="absolute inset-4 rounded-full bg-white" />
            <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">
              {formatPercent(noShowPercent)}
            </div>
          </div>

          <div className="w-full max-w-xs space-y-3">
            {statusStyles.map((status) => {
              const count = summary[status.key];
              const percent = total === 0 ? 0 : (count / total) * 100;
              return (
                <div
                  key={status.key}
                  className="flex items-center justify-between gap-3 text-sm text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${status.dot}`} />
                    <span>{status.label}</span>
                  </div>
                  <span className="font-medium">
                    {count} ({formatPercent(percent)})
                  </span>
                </div>
              );
            })}
            {total === 0 && (
              <p className="text-sm text-gray-500">No appointments this month.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
