import React, { useEffect, useState} from 'react';
import axios from 'axios';
import catchResponseError from './responseError';

const apiUrl = process.env.REACT_APP_PROXY_URL;


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


function convertISOToDDMMYYYY(isoString) {
  const date = new Date(isoString);
  
  const formattedDate = [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear()
  ].join('.');
  
  return formattedDate;
}


export default function MyDutiesCard({ branch, initDataUnsafe }) {
  const [nextDuties, setNextDuties] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextDuty = async () => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 13);

      try {
        const response = await axios.get(`${apiUrl}/api/userDuties`, {
          params: {
            branch: branch,
            user_id: initDataUnsafe.user.id,
            startDate: today.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0]
          }
        });
        setNextDuties(response.data)
        setLoading(false)
      } catch (error) {
        catchResponseError(error)
      }
    };
    // Prevent passing empty branch before auth is complete
    if (branch){
      fetchNextDuty();
    }
  }, [branch, initDataUnsafe]);

  return (
    <div className="w-full mb-3 rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 dark:from-[#7941b2] dark:to-[#3d0273]">
      <div className="px-2 py-3">
        <h2 className="text-lg font-bold text-white mb-2">Мои смены</h2>
        {loading 
          ? <SkeletonLoader />
          :
            <div className="space-y-1">
              {nextDuties.length > 0
              ? 
              nextDuties.map((duty, index) => (
                <p key={index} className="text-sm text-white">
                  <span className="font-semibold">{convertISOToDDMMYYYY(duty.date)}:</span> {convertToDutyString(duty.hours)}
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
      <div className="h-4 rounded bg-gray-200 dark:bg-gray-400"></div>
      <div className="h-4 rounded w-5/6 bg-gray-200 dark:bg-gray-400"></div>
      <div className="h-4 rounded w-4/6 bg-gray-200 dark:bg-gray-400"></div>
    </div>
  );
}