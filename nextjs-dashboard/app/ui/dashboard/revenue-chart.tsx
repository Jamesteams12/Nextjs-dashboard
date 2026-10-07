import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const patientTrend = [
  { month: 'Jan', count: 7 },
  { month: 'Feb', count: 9 },
  { month: 'Mar', count: 11 },
  { month: 'Apr', count: 15 },
  { month: 'May', count: 17 },
  { month: 'Jun', count: 16 },
];

const chartHeight = 260;
const topLabel = 20;

export default async function RevenueChart() {
  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        New patients by month
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          {patientTrend.map((month) => (
            <div key={month.month} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-400"
                style={{
                  height: `${(chartHeight / topLabel) * month.count}px`,
                }}
              ></div>
              <p className="text-sm text-gray-500">{month.month}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Last 6 months</h3>
        </div>
      </div>
    </div>
  );
}
