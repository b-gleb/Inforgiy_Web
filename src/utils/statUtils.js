import { format, startOfMonth, endOfMonth} from 'date-fns';

export function calcYearIntervals (year) {
  const intervals = [];
  
  intervals.push([format(new Date(year, 0, 1), 'yyyy-MM-dd'), format(new Date(year, 11, 31), 'yyyy-MM-dd')]);

  const months = Array.from({ length: 12 }, (_, i) => i);
  for (const month of months) {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));

    intervals.push([format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')]);
  };
  return intervals;
};

export function transformStatsOverviewData(data) {
  const rows = [];

  data.forEach(entry => {
    const {user, data} = entry;
    const row = {user};
    
    for (const entry of data) {
      const range = `${entry.dateRange[0].split("T")[0]}_${entry.dateRange[1].split("T")[0]}`;
      row[range] = entry.count;
    };
      
    rows.push(row);
  });

  return rows;
};
