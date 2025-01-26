import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import catchResponseError from '../responseError';

const apiUrl = process.env.REACT_APP_PROXY_URL;

export default function PersonalStats({ branch, user_id }) {
  const [personalStatsData, setPersonalStatsData] = useState(null);

  useEffect(() => {
    const now = new Date();

    const getWeekRange = (date) => {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)); // Monday as first day
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return [startOfWeek, endOfWeek];
    };

    const getMonthRange = (date) => {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return [startOfMonth, endOfMonth];
    };

    const getYearRange = (date) => {
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const endOfYear = new Date(date.getFullYear(), 11, 31);
      return [startOfYear, endOfYear];
    };

    const currentWeekRange = getWeekRange(now);
    const previousWeekRange = getWeekRange(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const currentMonthRange = getMonthRange(now);
    const previousMonthRange = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()));
    const currentYearRange = getYearRange(now);

    const fetchPersonalStats = async () => {
      try {
        const response = await axios.post(`${apiUrl}/api/stats`, {
          branch: branch,
          user_ids: [user_id],
          dateRanges: [
            [format(currentWeekRange[0], 'yyyy-MM-dd'), format(currentWeekRange[1], 'yyyy-MM-dd')],
            [format(previousWeekRange[0], 'yyyy-MM-dd'), format(previousWeekRange[1], 'yyyy-MM-dd')],
            [format(currentMonthRange[0], 'yyyy-MM-dd'), format(currentMonthRange[1], 'yyyy-MM-dd')],
            [format(previousMonthRange[0], 'yyyy-MM-dd'), format(previousMonthRange[1], 'yyyy-MM-dd')],
            [format(currentYearRange[0], 'yyyy-MM-dd'), format(currentYearRange[1], 'yyyy-MM-dd')]
          ]
        });

        const stats  = Object.values(response.data)[0];
        setPersonalStatsData({
          currentWeek: stats[0].count,
          previousWeek: stats[1].count,
          currentMonth: stats[2].count,
          previousMonth: stats[3].count,
          currentYear: stats[4].count
        });

      } catch (error) {
        catchResponseError(error);
      }
    };

    fetchPersonalStats();
  }, [branch, user_id])


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