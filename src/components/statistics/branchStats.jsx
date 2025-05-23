import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, isSameMonth} from 'date-fns';
import { ru } from "date-fns/locale";
import axios from 'axios';
import fetchAllUsers from '../../services/fetchAllUsers';
import catchResponseError from '../../utils/responseError';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import gridTheme from '../../styles/gridTheme';
import localeText from '../../utils/gridLocale';
import {
  ModuleRegistry,
  ValidationModule,
  NumberFilterModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  CellStyleModule,
  LocaleModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ValidationModule,
  NumberFilterModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  CellStyleModule,
  LocaleModule
]);

const apiUrl = import.meta.env.VITE_PROXY_URL;


async function fetchBranchStats (branch, user_ids, dateRanges) {
  try {
    const response = await axios.post(`${apiUrl}/api/stats`, {
      branch: branch,
      user_ids: user_ids,
      dateRanges: dateRanges
    });

    return response.data;
  } catch (error) {
    catchResponseError(error);
  }
};


function calculateIntervals (year) {
  const intervals = [];
  
  intervals.push([format(new Date(year, 0, 1), 'yyyy-MM-dd'), format(new Date(year, 11, 31), 'yyyy-MM-dd')]);

  const months = Array.from({ length: 12 }, (_, i) => i);
  for (const month of months) {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));

    intervals.push([format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')]);
  };
  return intervals;
}


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


function transformData(data) {
  const rows = [];

  for (const [user, entries] of Object.entries(data)) {
      const row = { user };
      
      for (const entry of entries) {
          const range = `${entry.dateRange[0].split("T")[0]}_${entry.dateRange[1].split("T")[0]}`;
          row[range] = entry.count;
      };
      rows.push(row);
  };
  return { rows };
};


const cellClass = ( params ) => {
  if (
    params.value <= 0 && 
    params.column?.originalParent?.expanded === true &&
    params.column?.originalParent?.expandable === true
  ){
    return 'text-[#ff0000]'
  }
}


export default function BranchStats({ branch, initDataUnsafe }) {
  const [allUsers, setAllUsers] = useState(null);
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


   // Set Table Theme
   useEffect(() => {
    document.body.dataset.agThemeMode = window.Telegram.WebApp.colorScheme;
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

      const branchStats = await fetchBranchStats(branch, allUsers, intervals);
      const { rows } = transformData(branchStats);

      // Add new data to already existing columns
      setRowData((prevData) => {
        return prevData.map((row) => {
          const newColumns = rows.find((item) => item.user === row.user);
          return newColumns ? { ...row, ...newColumns } : row;
        });
      });
    };

    // Adjust the width of opened columns
    if (params.columnGroup.isExpanded() === true){
      const colArray = params.columnGroup.children.map(col => col.getId());
      params.api.autoSizeColumns(colArray)
    }
  }, [branch, allUsers]);


  useEffect(() => {
    const generateTable = async () => {
      try {
        const year = new Date().getFullYear();
        const allUsers = await fetchAllUsers(branch, initDataUnsafe);
        const allUserIds = allUsers.map(userObj => userObj.id);
        const yearlyColumnDefs = generateColumnDefs(year);
        const intervalsToFetch = calculateIntervals(year);
        const branchStats = await fetchBranchStats(branch, allUserIds, intervalsToFetch);
        const { rows } = transformData(branchStats);

        setAllUsers(allUserIds);
        setRowData(rows);
        setColumnDefs([
          {
            field: "user",
            headerName: "Позывной",
            pinned: 'left',
            filter: null,
            cellClass: null
          },
          ...yearlyColumnDefs
        ]);
      } catch (error) {
        
      };
    };

    generateTable();
  }, [branch, initDataUnsafe])


  return (
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onColumnGroupOpened={onColumnGroupOpened}
        autoSizeStrategy={autoSizeStrategy}
        suppressColumnVirtualisation={true} // to autosize columns not in viewport
        localeText={localeText}
        gridOptions={{
          theme: gridTheme,
        }}
      />
  );
};