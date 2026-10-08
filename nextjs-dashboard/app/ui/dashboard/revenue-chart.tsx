import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchPatientGrowth } from '@/app/lib/data';

const chartHeight = 220;

export default async function RevenueChart() {
  const patientGrowth = await fetchPatientGrowth();
  const maximum = Math.max(1, ...patientGrowth.map(({ count }) => count));

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        How many patients did you add each month?
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div
          className="grid grid-cols-6 items-end gap-2 rounded-md bg-white p-4 md:gap-4"
          aria-label="Patients created during the past six months"
        >
          {patientGrowth.map((month) => (
            <div
              key={month.month}
              className="flex flex-col items-center justify-end gap-2"
            >
              <span className="text-xs text-gray-600">{month.count}</span>
              <div
                className="w-full rounded-md bg-blue-400"
                style={{
                  height: `${Math.max(4, (chartHeight * month.count) / maximum)}px`,
                }}
                aria-label={`${month.count} patients in ${month.month}`}
              />
              <p className="text-sm text-gray-500">{month.month}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <p className="ml-2 text-sm text-gray-500">Past six months</p>
        </div>
      </div>
    </div>
  );
}
