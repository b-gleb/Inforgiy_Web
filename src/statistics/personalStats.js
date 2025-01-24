import React, { useEffect, useState } from 'react';
import axios from 'axios';
import catchResponseError from '../responseError';

const apiUrl = process.env.REACT_APP_PROXY_URL;

export default function PersonalStats({ user_id }) {
  const [personalStatsData, setPersonalStatsData] = useState(null);

  useEffect(() => {
    const fetchPersonalStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/stats/user`, {
          params: {
            user_id: user_id
          }
        });

        setPersonalStatsData(response.data);

      } catch (error) {
        catchResponseError(error);
      }
    };

    // fetchPersonalStats();
    setPersonalStatsData({
      currentWeek: 10,
      previousWeek: 5,
      currentMonth: 50,
      previousMonth: 70,
      currentYear: 200
    })
  }, [user_id])


  return (
    <div className="flex flex-wrap justify-evenly py-2 bg-gray-100">
      <StatCard 
        label="Неделя"
        sublabel="от прошлой"
        current={personalStatsData?.currentWeek ?? null}
        previous={personalStatsData?.previousWeek ?? null}
      />
      <StatCard 
        label="Месяц"
        sublabel="от прошлого"
        current={personalStatsData?.currentMonth ?? null}
        previous={personalStatsData?.previousMonth ?? null}
      />
      <StatCard 
        label="Год"
        sublabel="от прошлого"
        current={personalStatsData?.currentYear ?? null}
        previous={personalStatsData?.previousYear ?? null}
      />
    </div>
  );
};


const StatCard = ({ label, sublabel, current, previous }) => {
  const showComparison = previous !== undefined && previous !== null;
  const isPositive = showComparison && current > previous;
  const change = showComparison ? current - previous : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-2 w-1/4">
      <h3 className="text-base font-semibold text-gray-500 mb-2">{label}</h3>
      {current === null ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-semibold text-gray-800 mb-2">{current}</div>
          {showComparison && (
            <div className="flex items-center">
              <span className={`text-[0.6rem] ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}
              </span>
              <span className="text-[0.6rem] text-gray-500 ml-1">{sublabel}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};