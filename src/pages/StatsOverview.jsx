import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, isSameMonth} from 'date-fns';
import { ru } from "date-fns/locale";

// API
import { useGetUsers } from '@/hooks/userHooks';
import { useGetStats } from '@/hooks/statHooks';
import { getStats } from '@/services/api.ts';
import catchResponseError from '@/utils/responseError';

// Utils
import { calcYearIntervals, transformStatsOverviewData } from '@/utils/statUtils';
import { userColors } from '@/utils/userColors.js';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import gridTheme from '@/styles/gridTheme';
import localeText from '@/utils/gridLocale';
import {
  ModuleRegistry,
  ValidationModule,
  NumberFilterModule,
  ExternalFilterModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  CellStyleModule,
  LocaleModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ValidationModule,
  NumberFilterModule,
  ExternalFilterModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  CellStyleModule,
  LocaleModule
]);


// TODO: restructure use states
// TODO: Think of invalidation strategy
export default function StatsOverview() {
  const location = useLocation();
  const { branch, initDataUnsafe } = location.state || {};
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const year = new Date().getFullYear();
  const yearlyColumnDefs = useMemo(() => generateColumnDefs(year), [year]);
  const dateRanges = useMemo(() => calcYearIntervals(year), [year]);

  let colorFilter = 'all';
  const [colorMap, setColorMap] = useState({'all': 'Все цвета'});
  const { data: userIds = [] } = useGetUsers(
    { branch, initDataUnsafe },
    { select: users => users.map(user => user.id) }
  );

  const { data } = useGetStats(
    { branch, userIds, dateRanges },
    {
      select: stats => {
      const transformed = transformStatsOverviewData(stats);

      return {
        stats: transformed,
        colors: getColorMap(transformed),
      };
    },
      enabled: userIds.length >= 1
    }
  );


  const [columnDefs, setColumnDefs] = useState(null);
  const [rowData, setRowData] = useState(null);
  const [defaultColDef] = useState({
    sortable: true,
    filter: "agNumberColumnFilter",
    filterParams: {
      filterOptions: ['inRange'],
      inRangeInclusive: true,
      buttons: ['apply', 'reset'],
      closeOnApply: true,
      maxNumConditions: 1
    },
    suppressMovable: true,
    wrapText: true,
    cellClass: cellClass
  });

  // Checking if all the neccessary location states exist, otherwise redirect
  const requiredParams = [branch, initDataUnsafe];
  useEffect(() => {
    if (requiredParams.some(param => param === undefined)){
      navigate('/Inforgiy_Web/', { replace: true })
    }
  }, [navigate, requiredParams])

  if (requiredParams.some(param => param === undefined)){
    return null;
  };

  // Telegram UI BackButton
  useEffect(() => {
    const handleBackClick = () => {
      navigate(-1);
    };

    window.Telegram.WebApp.BackButton.onClick(handleBackClick);
    window.Telegram.WebApp.BackButton.show();

    // Cleanup the event listener when the component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick(handleBackClick);
      window.Telegram.WebApp.BackButton.hide();
    };
  }, []);


  // Set Table Theme
  useEffect(() => {
    document.body.dataset.agThemeMode = sessionStorage.getItem('theme') || 'light';
  }, []);

  const autoSizeStrategy = useMemo(() => {
    return {
      type: 'fitCellContents'
    };
  }, []);


  const onColumnGroupOpened = useCallback( async (params) => {
    if (params.columnGroup.level === 1 && params.columnGroup.isExpanded() === true) {
      const intervals = [];

      for (const column of params.columnGroup.children) {
        const colIdSplit = column.colId.split('_');
        intervals.push([colIdSplit[0], colIdSplit[1]]);
      };

      const branchStats = await fetchBranchStats(branch, userIds, intervals);
      const { rows } = transformStatsOverviewData(branchStats);

      // Add new data to already existing columns
      setRowData((prevData) => {
        return prevData.map((row) => {
          const newColumns = rows.find((item) => item.user.nick === row.user.nick);
          return newColumns ? { ...row, ...newColumns } : row;
        });
      });
    };

    // Adjust the width of opened columns
    if (params.columnGroup.isExpanded() === true){
      const colArray = params.columnGroup.children.map(col => col.getId());
      params.api.autoSizeColumns(colArray)
    }
  }, [branch, userIds]);


  const isExternalFilterPresent = useCallback(() => {
    return colorFilter !== "all";
  }, []);



  const externalFilterChanged = useCallback((newValue) => {
    colorFilter = newValue
    gridRef.current.api.onFilterChanged();
  }, []);


  const doesExternalFilterPass = useCallback((node) => {
    if (node.data) {
      if (node.data.user.color == colorFilter) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return true;
    };
  }, [colorFilter]);


  useEffect(() => {
    if (!data) return;

    setRowData(data.stats);
    setColumnDefs([
      {
        field: "user",
        headerName: "Позывной",
        pinned: 'left',
        filter: null,
        valueGetter: (params) => params.data.user?.nick || '???',
        cellClass: null
      },
      ...yearlyColumnDefs
    ]);
    setColorMap(data.colors);
  }, [data, yearlyColumnDefs])


  return (
    <div className={`w-full h-full flex flex-col fixed inset-0 bg-background ${sessionStorage.getItem('theme') || 'light'}`}>
        <div className='ml-1 text-black dark:text-[#D9D6D6] text-sm'>
          <label htmlFor='colorFilter'>Цвет: </label>
          <select
            name='colorFilter'
            id='colorFilter'
            onChange={(e) => externalFilterChanged(e.target.value)}
          >
            {Object.keys(colorMap).map((colorId) => {
              return (
                <option
                  key={colorId}
                  value={colorId}
                >
                  {colorMap[colorId]}
                </option>
              )
            })}
          </select>
        </div>

      <div className='w-full h-full flex-1 overflow-hidden'>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          onColumnGroupOpened={onColumnGroupOpened}
          autoSizeStrategy={autoSizeStrategy}
          suppressColumnVirtualisation={true} // to autosize columns not in viewport
          localeText={localeText}
          hidePaddedHeaderRows={true}
          gridOptions={{
            theme: gridTheme,
          }}
        />
      </div>
    </div>
  );
};


async function fetchBranchStats (branch, userIds, dateRanges) {
  try {
    const response = await getStats({
      branch,
      userIds,
      dateRanges
    });

    return response.data;
  } catch (error) {
    catchResponseError(error);
  }
};



function generateColumnDefs(year) {
  const columnDefs = [];
  const months = Array.from({ length: 12 }, (_, i) => i);

  const yearColumnDefs = {
    field: `${year}`,
    openByDefault: true,
    children: [],
  };

  for (const month of months) {
    const monthChildren = [];
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));

    let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });

    while (currentWeekStart <= monthEnd) {
      // Ensure the week is only within the current month
      if (!isSameMonth(currentWeekStart, monthStart)) {
        currentWeekStart = addWeeks(currentWeekStart, 1);
      };

      let currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

      monthChildren.push({
        field: `${format(currentWeekStart, 'yyyy-MM-dd')}_${format(currentWeekEnd, 'yyyy-MM-dd')}`,
        headerName: `${format(currentWeekStart, 'dd.MM')} - ${format(currentWeekEnd, 'dd.MM')}`,
        columnGroupShow: 'open'
      });

      currentWeekStart = addWeeks(currentWeekStart, 1);
    };

    // Monthly total
    monthChildren.push({
      field: `${format(monthStart, 'yyyy-MM-dd')}_${format(monthEnd, 'yyyy-MM-dd')}`,
      headerName: 'Итого',
      columnGroupShow: 'closed'
    })

    yearColumnDefs.children.push({
      field: format(monthStart, 'yyyy-MM'),
      headerName: format(monthStart, 'LLLL', { locale: ru }),
      columnGroupShow: 'open',
      children: monthChildren,
    });
  };

  // Yearly totals
  yearColumnDefs.children.push({
    field: `${format(new Date(year, 0, 1), 'yyyy-MM-dd')}_${format(new Date(year, 11, 31), 'yyyy-MM-dd')}`,
    headerName: 'Итого',
    columnGroupShow: 'closed'
  })

  columnDefs.push(yearColumnDefs);
  return columnDefs;
};


const getColorMap = (data) => {
  const colorMap = {all: 'Все цвета'};
  const seenColors = new Set();

  for (const item of data) {
    const color = item.user?.color;
    if (color != null && !seenColors.has(color)) {
      seenColors.add(color);
      if (userColors[color]) {
        colorMap[color] = userColors[color];
      }
    }
  };

  return colorMap;
};


const cellClass = ( params ) => {
  if (
    params.value <= 0 && 
    params.column?.originalParent?.expanded === true &&
    params.column?.originalParent?.expandable === true
  ){
    return 'text-[#ff0000]'
  }
};
