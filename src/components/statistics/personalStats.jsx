import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, addWeeks, subMonths, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Skeletons
import BarChartSkeleton from '../skeletons/barChartSkeleton';
import LineChartSkeleton from '../skeletons/lineChartSkeleton';

// API
import api from '../../services/api.js';
import catchResponseError from '../../utils/responseError';


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


export default function PersonalStats({ branch, user_id }) {
  // CARDS
  const [personalStatsData, setPersonalStatsData] = useState(null);

  useEffect(() => {
    const now = new Date();

    const fetchPersonalStats = async () => {
      try {
        const response = await api.post('/api/stats', {
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
    dataLabels: {
      formatter: (val) => (val === 0 ? "" : val),
    },
    yaxis: {
      show: false
    },
    colors: ["#F69200"],
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
        
        const response = await api.post('/api/stats', {
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
            labels: {
              style: {
                colors: '#808080',
                fontSize: '12px',
              }
            }
          }
        }));
      
      } catch (error) {
        catchResponseError(error);
      };
    };

    fetchWeeklyStats();  
  }, [branch, user_id])


  // Cumulative month stats
  const [dayByDaySeries, setDayByDaySeries] = useState(null);
  const [dayByDayOptions] = useState({
    chart: {
      id: "cumulative",
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
    xaxis: {
      categories: Array.from({ length: 31 }, (_, i) => i + 1),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        show: false
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#808080',
          fontSize: '12px',
        }
      }
    },
    legend: {
      show: true,
      labels: {
        colors: '#808080'
      },
    },
    stroke: {
      width: [2, 4],
    },
    markers: {
      discrete: [
        {
          seriesIndex: 1,
          dataPointIndex: new Date().getDate() - 1,
          fillColor: "#F69200",
          strokeColor: "#FFFFFF",
          size: 5,
          shape: "circle",
        },
      ],
    },
    colors: ["#E6D3B8", "#F69200"],
  });

  useEffect(() => {
    const fetchDayByDayStats = async () => {
      try {
        const today = new Date();
        const response = await api.post('/api/stats/cumulative', {
          branch: branch,
          user_id: user_id,
          dateRanges: [
            [
              format(startOfMonth(today), 'yyyy-MM-dd'),
              format(today, 'yyyy-MM-dd'),
            ], 
            getMonthRange(subMonths(today, 1))
          ]
        });

        setDayByDaySeries([
          {
            name: "Прошлый месяц",
            data: response.data[1].data.map(item => item.cumulativeCount)
          },
          {
            name: "Текущий месяц",
            data: response.data[0].data.map(item => item.cumulativeCount)
          },
        ]);


      } catch (error) {
        catchResponseError(error);
      };
    };

    fetchDayByDayStats();
  }, [branch, user_id])


  return (
    <>
    <div className="max-w-md mx-auto flex justify-between gap-x-8 bg-white dark:bg-neutral-900">
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

    <h2 className='text-xs mt-6 text-gray-500 dark:text-[#808080]'>Количество смен за последние 12 недель</h2>
    <div className="w-full max-w-md mx-auto px-2">
      {weeklyChartSeries ?
        <Chart options={weeklyChartOptions} series={weeklyChartSeries} type="bar" />
        :
        <BarChartSkeleton/>
      }
    </div>

    <h2 className='text-xs text-gray-500 dark:text-[#808080]'>Количество смен относительно прошлого месяца</h2>
    <div className="w-full max-w-md mx-auto px-2">
      {dayByDaySeries ?
        <Chart options={dayByDayOptions} series={dayByDaySeries} type="line" />
        :
        <LineChartSkeleton/>
      }
    </div>

    </>
  );
};


const StatCard = ({ label, sublabel, current, previous }) => {
  const showComparison = previous !== undefined && previous !== null;
  const isPositive = showComparison && current > previous;
  const change = showComparison ? current - previous : 0;

  return (
    <div className="flex-1 p-2 rounded-2xl shadow-md bg-white dark:bg-neutral-800">
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