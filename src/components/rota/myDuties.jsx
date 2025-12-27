import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useUserDuties } from '@/hooks/rotaHooks';

function convertToDutyString(hours) {
  if (!hours || hours.length === 0) return "";

  hours.sort((a, b) => a - b);
  let result = [];
  let start = hours[0]; // Start of the current group
  let end = start; // End of the current group

  for (let i = 1; i < hours.length; i++) {
      if (hours[i] === end + 1) {
          // Extend the current group
          end = hours[i];
      } else {
          // Push the current group and start a new one
          result.push(`${start.toString().padStart(2, "0")}:00-${(end + 1).toString().padStart(2, "0")}:00`);
          start = hours[i];
          end = start;
      }
  }

  // Push the last group
  result.push(`${start.toString().padStart(2, "0")}:00-${(end + 1).toString().padStart(2, "0")}:00`);
  return result.join("; ");
}

export default function MyDutiesCard({ branch, userId, prevDays = 0, nextDays = 14 }) {
  const { duties, loading, error } = useUserDuties({
    branch,
    userId,
    prevDays,
    nextDays
  });

  return (
    <div className="w-full mb-3 rounded-xl shadow-lg overflow-hidden bg-linear-to-br from-purple-400 to-purple-600 dark:from-[#7941b2] dark:to-[#3d0273]">
      <div className="px-2 py-3">
        <h2 className="text-lg font-bold text-white mb-2">Мои смены</h2>
        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <p className='text-sm text-white'>Ошибка загрузки №{error.status}</p>
        ) : (
          <div className="space-y-1">
            {duties.length > 0
            ? 
            duties.map((duty, index) => (
              <p key={index} className="text-sm text-white">
                <span className="font-semibold">{format(duty.date, 'dd.MM (EEEE)', { locale: ru })}:</span> {convertToDutyString(duty.hours)}
              </p>
            ))
            : <p className='text-sm text-white'>Смен нет :(</p>
            }
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4"/>
      <Skeleton className="h-4 w-5/6"/>
    </div>
  );
}