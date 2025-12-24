import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, addWeeks, subMonths, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Components
import StatCard from '@/components/stats/StatCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';

// API
import { getStats, getStatsCumulative } from '@/services/api.js';
import catchResponseError from '../../utils/responseError.jsx';

function getWeekRange (date) {
  const weekStart = startOfWeek(date, {weekStartsOn: 1});
  const weekEnd = endOfWeek(date, {weekStartsOn: 1});
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


export default function PersonalStats({ branch, userId }) {
  // CARDS
  const [personalStatsData, setPersonalStatsData] = useState(null);

  useEffect(() => {
    const now = new Date();

    const fetchPersonalStats = async () => {
      try {
        const response = await getStats({
          branch,
          userIds: [userId],
          dateRanges: [
            getWeekRange(now),
            getWeekRange(subWeeks(now, 1)),
            getMonthRange(now),
            getMonthRange(subMonths(now, 1)),
            getYearRange(now)
          ]
        });

        const stats  = response[0].data;
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
  }, [branch, userId])


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
        
        const response = await getStats({
          branch: branch,
          userIds: [userId],
          dateRanges: weekRanges
        });

        setWeeklyChartSeries([{
          name: response[0].user.nick,
          data: response[0].data.map(item => item.count)
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
  }, [branch, userId])


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
        const response = await getStatsCumulative({
          branch,
          userId,
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
            data: response[1].data.map(item => item.count)
          },
          {
            name: "Текущий месяц",
            data: response[0].data.map(item => item.count)
          },
        ]);


      } catch (error) {
        catchResponseError(error);
      };
    };

    fetchDayByDayStats();
  }, [branch, userId])


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

    <h3 className='text-xs mt-6 text-muted-foreground'>Количество смен за последние 12 недель</h3>
    <div className="w-full max-w-md mx-auto px-2">
      {weeklyChartSeries ?
        <Chart options={weeklyChartOptions} series={weeklyChartSeries} type="bar" />
        :
        <Skeleton className="w-full h-[230px] my-2"/>
      }
    </div>

    <h3 className='text-xs text-muted-foreground'>Количество смен относительно прошлого месяца</h3>
    <div className="w-full max-w-md mx-auto px-2">
      {dayByDaySeries ?
        <Chart options={dayByDayOptions} series={dayByDaySeries} type="line" />
        :
        <Skeleton className="w-full h-[230px] my-2"/>
      }
    </div>

    </>
  );
};
