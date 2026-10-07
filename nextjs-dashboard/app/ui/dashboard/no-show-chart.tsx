import { lusitana } from '@/app/ui/fonts';

const appointmentStatus = [
  { label: 'Booked', value: 72, color: 'bg-emerald-500' },
  { label: 'Done', value: 22, color: 'bg-sky-500' },
  { label: 'No-show', value: 6, color: 'bg-rose-500' },
];

const donutStyle = {
  background: `conic-gradient(#22c55e 0 72%, #3b82f6 72% 94%, #ef4444 94% 100%)`,
};

export default function NoShowChart() {
  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        No-show share this month
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-6 rounded-md bg-white p-6 md:flex-row md:justify-between">
          <div
            className="relative h-40 w-40 rounded-full shadow-inner"
            style={donutStyle}
            aria-label="No-show chart"
          >
            <div className="absolute inset-4 rounded-full bg-white" />
            <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">
              6%
            </div>
          </div>

          <div className="w-full max-w-xs space-y-3">
            {appointmentStatus.map((status) => (
              <div key={status.label} className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${status.color}`} />
                  <span>{status.label}</span>
                </div>
                <span className="font-medium">{status.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
