import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, addWeeks, subMonths, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import catchResponseError from '../utils/responseError';

const apiUrl = process.env.REACT_APP_PROXY_URL;

function getWeekRange (date) {
  const weekStart = startOfWeek(date, {weekStartsOn: 1});
  const weekEnd = endOfWeek(date, {weelStartsOn: 1});
  return [format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')];
};

function getMonthRange (date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  return [format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')];
};

function getYearRange (date) {
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);
  return [format(yearStart, 'yyyy-MM-dd'), format(yearEnd, 'yyyy-MM-dd')];
};


const LineChart = () => {
  const chartOptions = {
    chart: {
      id: "line-chart",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    },
    stroke: {
      curve: "smooth",
    },
    colors: ["#008FFB"],
  };

  const chartSeries = [
    {
      name: "Sales",
      data: [30, 40, 45, 50, 49, 60, 70],
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <Chart options={chartOptions} series={chartSeries} type="line" />
    </div>
  );
};

export default function PersonalStats({ branch, user_id }) {
  // CARDS
  const [personalStatsData, setPersonalStatsData] = useState(null);

  useEffect(() => {
    const now = new Date();

    const fetchPersonalStats = async () => {
      try {
        const response = await axios.post(`${apiUrl}/api/stats`, {
          branch: branch,
          user_ids: [user_id],
          dateRanges: [
            getWeekRange(now),
            getWeekRange(subWeeks(now, 1)),
            getMonthRange(now),
            getMonthRange(subMonths(now, 1)),
            getYearRange(now)
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


  // Weekly Bars
  const [weeklyChartSeries, setWeeklyChartSeries] = useState(null);
  const [weeklyChartOptions, setWeeklyChartOptions] = useState({
    chart: {
      id: "weekly-chart",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
    },
    grid: {
      show: false
    },
    tooltip: {
      enabled: false
    },
    yaxis: {
      show: false
    },
    colors: ["#008FFB"],
  });


  useEffect(() => {
    const XWeekRanges = (weeks) => {
      const date = subWeeks(new Date(), weeks);
      const ranges = [];

      for (let i = 0; i <= weeks; i++) {
        ranges.push(getWeekRange(addWeeks(date, i)))
      };
      return ranges;
    };

    const fetchWeeklyStats = async () => {
      try {
        const weekRanges = XWeekRanges(11);
        
        const response = await axios.post(`${apiUrl}/api/stats`, {
          branch: branch,
          user_ids: [user_id],
          dateRanges: weekRanges
        });
        const user_nick = Object.keys(response.data)[0];

        setWeeklyChartSeries([{
          name: user_nick,
          data: response.data[user_nick].map(item => item.count)
        }]);

        setWeeklyChartOptions(prevOptions => ({
          ...prevOptions,
          xaxis: {
            categories: weekRanges.map(range => format(parseISO(range[0]), 'dd LLL', { locale: ru })),
          }
        }));
      
      } catch (error) {
        catchResponseError(error);
      };
    };

    fetchWeeklyStats();  
  }, [branch, user_id])


  return (
    <>
    <div className="flex flex-wrap justify-evenly py-2 bg-gray-100 dark:bg-neutral-900">
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

    <LineChart/>

    {weeklyChartSeries && (
      <div className="w-full max-w-md mx-auto px-2">
        <Chart options={weeklyChartOptions} series={weeklyChartSeries} type="bar" />
      </div>
    )}
    </>
  );
};


const StatCard = ({ label, sublabel, current, previous }) => {
  const showComparison = previous !== undefined && previous !== null;
  const isPositive = showComparison && current > previous;
  const change = showComparison ? current - previous : 0;

  return (
    <div className="rounded-2xl shadow-md p-2 w-1/4 bg-white dark:bg-neutral-800">
      <h3 className="text-base font-semibold mb-2 text-gray-500 dark:text-gray-400">{label}</h3>
      {current === null ? (
        <div className="animate-pulse">
          <div className="h-10 rounded-sm w-3/4 mb-2 bg-gray-200 dark:bg-neutral-700"></div>
          <div className="h-4 rounded-sm w-1/2 bg-gray-200 dark:bg-neutral-700"></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{current}</div>
          {showComparison && (
            <div className="flex items-center">
              <span className={`text-[0.6rem] ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}
              </span>
              <span className="text-[0.6rem] ml-1 text-gray-500 dark:text-gray-400">{sublabel}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};