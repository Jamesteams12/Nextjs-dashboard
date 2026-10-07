import { HeartIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center gap-3 leading-none text-white`}
    >
      <HeartIcon className="h-8 w-8 text-rose-200" />
      <p className="text-[30px] md:text-[44px]">James Medical Clinic</p>
    </div>
  );
}
