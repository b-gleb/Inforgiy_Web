import React, { useEffect, useState} from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';

import userDuties from '../../services/userDuties.jsx';

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
  const [nextDuties, setNextDuties] = useState(null);

  useEffect(() => {
    const fetchNextDuty = async () => {
      const today = new Date();

      userDuties(
        branch,
        userId,
        subDays(today, prevDays),
        addDays(today, nextDays)
      )
        .then((result) => {setNextDuties(result)})
        .catch(() => {});
    };
    // Prevent passing empty branch before auth is complete
    if (branch && userId){
      fetchNextDuty();
    }
  }, [branch, userId, prevDays, nextDays]);


  return (
    <div className="w-full mb-3 rounded-xl shadow-lg overflow-hidden bg-linear-to-br from-purple-400 to-purple-600 dark:from-[#7941b2] dark:to-[#3d0273]">
      <div className="px-2 py-3">
        <h2 className="text-lg font-bold text-white mb-2">Мои смены</h2>
        {!nextDuties 
          ? <SkeletonLoader />
          :
            <div className="space-y-1">
              {nextDuties.length > 0
              ? 
              nextDuties.map((duty, index) => (
                <p key={index} className="text-sm text-white">
                  <span className="font-semibold">{format(duty.date, 'dd.MM (EEEE)', { locale: ru })}:</span> {convertToDutyString(duty.hours)}
                </p>
              ))
              : <p className='text-sm text-white'>Смен нет :(</p>
              }
            </div>
        }
      </div>
    </div>
  )
}


function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 rounded-sm bg-gray-200 dark:bg-gray-400"></div>
      <div className="h-4 rounded-sm w-5/6 bg-gray-200 dark:bg-gray-400"></div>
      <div className="h-4 rounded-sm w-4/6 bg-gray-200 dark:bg-gray-400"></div>
    </div>
  );
}