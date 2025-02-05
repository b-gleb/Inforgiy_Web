import React, { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, isSameMonth} from 'date-fns';
import { ru } from "date-fns/locale";
import axios from 'axios';
import catchResponseError from '../responseError';

import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  AllCommunityModule,
]);

const apiUrl = process.env.REACT_APP_PROXY_URL;

const myTheme = themeQuartz
	.withParams({
    browserColorScheme: "dark",
    backgroundColor: "#1f2836",
    columnBorder: true,
    fontFamily: "inherit",
    fontSize: 10,
    foregroundColor: "#D6D6D6",
    headerFontSize: 10,
    headerFontWeight: 700,
    iconSize: 12,
    oddRowBackgroundColor: "#1F2836",
    spacing: 5,
    wrapperBorderRadius: 0
   }, 'dark')
  .withParams({
    browserColorScheme: "light",
    columnBorder: true,
    fontFamily: "inherit",
    fontSize: 10,
    headerFontSize: 10,
    headerFontWeight: 700,
    iconSize: 12,
    oddRowBackgroundColor: "#F9F9F9",
    spacing: 5,
    wrapperBorderRadius: 0
   }, 'light');


async function fetchAllUsers (branch, initDataUnsafe) {
  try {
    const response = await axios.get(`${apiUrl}/api/users`, {
      params: {
        branch: branch,
        initDataUnsafe: initDataUnsafe
      }
    });

    return response.data.map((userObj) => userObj.id);
  } catch (error) {
    catchResponseError(error);
  }
};


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


export default function BranchStats({ branch, initDataUnsafe }) {
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState(null);
  const [columnDefs, setColumnDefs] = useState(null);
  const [rowData, setRowData] = useState(null);
  const [defaultColDef] = useState({
    sortable: true,
    filter: "agNumberColumnFilter",
    filterParams: {
      filterOptions: ['inRange']
    },
    suppressMovable: true,
  });

   useEffect(() => {
    document.body.dataset.agThemeMode = window.Telegram.WebApp.colorScheme;
  }, []);
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
  }, [branch, allUsers]);


  useEffect(() => {
    const generateTable = async () => {
      const year = new Date().getFullYear();
      const allUserIds = await fetchAllUsers(branch, initDataUnsafe);
      const yearlyColumnDefs = generateColumnDefs(year);
      const intervalsToFetch = calculateIntervals(year);
      const branchStats = await fetchBranchStats(branch, allUserIds, intervalsToFetch);
      const { rows } = transformData(branchStats);

      setAllUsers(allUserIds);
      setRowData(rows);
      setColumnDefs([
        {field: "user", headerName: "Позывной", filter: null, pinned: 'left'},
        ...yearlyColumnDefs
      ]);
    };

    generateTable();
    setIsLoading(false)
  }, [branch, initDataUnsafe])


  return (
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onColumnGroupOpened={onColumnGroupOpened}
        className='w-full h-full'
        autoSizeStrategy={autoSizeStrategy}
        gridOptions={{
          theme: myTheme,
        }}
      />
  );
};