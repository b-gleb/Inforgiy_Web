import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { convertToDutyString } from '@/utils/userDutiesConverter.js';
import { OctagonX } from 'lucide-react';
import { ApiStatus } from '@/types/apiStatus';

interface UserDutiesProps {
  /** API Status */
  status: ApiStatus;
  /** Information about user's duties obtained from the API */
  duties: Array<{
    date: string;
    hours: Array<number>
  }>
}

/** Card showing a summary of user's duties for the specified period of time*/
export default function UserDuties({ status, duties }: UserDutiesProps) {
  return (
    <div className="w-full mb-3 rounded-xl shadow-lg overflow-hidden bg-linear-to-br from-purple-400 to-purple-600 dark:from-[#7941b2] dark:to-[#3d0273]">
      <div className="px-2 py-3">
        <h2 className="text-lg font-bold text-white mb-2">Смены</h2>

        {status === 'pending' && (
          <div className="space-y-2">
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {status === 'error' && (
          <div className='flex items-center gap-1 text-white' role='alert'>
            <OctagonX className='h-4 w-4'/>
            <span className="text-sm">Ошибка загрузки!</span>
          </div>
        )}

        {status === 'success' && (
          duties.length > 0 ? (
            <div className="space-y-1">
              {duties.map((duty, index) => (
                <p key={index} className="text-sm text-white">
                  <span className="font-semibold">
                    {format(duty.date, 'dd.MM (EEEE)', { locale: ru })}:
                  </span>{' '}
                  {convertToDutyString(duty.hours)}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white">Смен нет :(</p>
          )
        )}
      </div>
    </div>
  );
}
