import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Custom components
import Loading from './components/loading';
import catchResponseError from './utils/responseError';

// CSS
import './styles/WeeklyView.css';

// AG Grid
import { AgGridReact } from 'ag-grid-react';
import gridTheme from './styles/gridTheme';
import {
  ModuleRegistry,
  ValidationModule,
  ScrollApiModule,
  ClientSideRowModelModule,
  RowAutoHeightModule,
  CellStyleModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ValidationModule,
  ScrollApiModule,
  ClientSideRowModelModule,
  RowAutoHeightModule,
  CellStyleModule,
]);

const apiUrl = process.env.REACT_APP_PROXY_URL;


function rowIndexToTime(rowIndex) {
  const start = rowIndex.toString().padStart(2, '0');
  const end = (rowIndex + 1).toString().padStart(2, '0');
  return `${start}:00 - ${end}:00`;
}


export default function WeeklyView({ branch, initDataUnsafe, setShowWeekly }) {
  const cellRenderer = ( params ) => {
    const value = params.value;
    if (!Array.isArray(value) || value.length === 0){return value};
  
    const nicks = value.map(user => {
      const nickName = user?.nick.split(' ')[0] ?? user.username;
  
      if (branch === 'gp' && user.color === 1) {
        return <span key={user.id} className="gp-green">{nickName}</span>;
      } else {
        return nickName;
      }
    });
  
    return (
      <>
        {nicks.map((nick, index) => (
          <React.Fragment key={index}>
            {index > 0 && ', '}
            {nick}
          </React.Fragment>
        ))}
      </>
    )
  };


  const cellClass = ( params ) => {
    const value = params.value;
    if (!Array.isArray(value)){return ''};

    if (value.length === 0){
      if (branch === 'gp'){
        return 'empty gp'
      } else {
        return 'empty'
      }
    }

    if (value.some(user => user.id === initDataUnsafe.user.id)) {
      return 'my-duty'
    }
  }

  const handleGridReady = (params) => {
    params.api.ensureColumnVisible(format(new Date(), 'yyyy-MM-dd'), 'start');
    setIsLoading(false);
  };


  const handleCellClicked = (params) => {
    if (params.colDef.field === 'index') {
      setShowWeekly(false)
    }
    else {
      setSelectedCellData({
        users: params?.value ?? [],
        date: new Date(params.colDef.field),
        rowIndex: params.rowIndex
      })
    }
  };


  const [isLoading, setIsLoading] = useState(true);
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [defaultColDef] = useState({
    sortable: false,
    suppressMovable: true,
    width: (window.innerWidth * 0.20),
    cellRenderer: cellRenderer,
    cellClass: cellClass,
    autoHeight: true,
    wrapText: true,
  });

  const getDays = () => {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    for (let i = 0; i < 25; i++) {
      const date = new Date(lastMonday);
      date.setDate(lastMonday.getDate() + i);
      days.push(date);
    }

    return days;
  };

  function transformColumnSchemaToRowSchema(columnDefs, data) {
    // Extract column names from columnDefs
    const columnNames = columnDefs.map((col) => col.field);
  
    // Transpose the data based on column schema to row schema
    const arrayOfObjects = data[0].map((_, rowIndex) => {
      const obj = {};
      columnNames.forEach((colName, colIndex) => {
        const cellData = data[colIndex][rowIndex];
        obj[colName] = cellData
      });
      return obj;
    });
  
    return arrayOfObjects;
  }


  // Telegram UI BackButton & Table Theme
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(() => {setShowWeekly(false)});
    window.Telegram.WebApp.BackButton.show();
    document.body.dataset.agThemeMode = window.Telegram.WebApp.colorScheme;

    // Cleanup the event listener when the component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [setShowWeekly]);


  useEffect(() => {
    const fetchRotaData = async () => {
      const fetchedRotaData = [];
      const days = getDays();

      for (const day of days) {
        try {
          const response = await axios.get(`${apiUrl}/api/rota`, {
            params: {
              branch: branch,
              date: format(day, 'yyyy-MM-dd')
            }
          });
          fetchedRotaData.push(response.data);
        } catch (error) {
          catchResponseError(error);
          fetchedRotaData.push({});
        }
      }

      // Format the dates and add them as columns
      const formattedDates = days.map((date) => ({
        field: format(date, 'yyyy-MM-dd'),
        headerName: format(date, "dd.MM EEEEEE", { locale: ru })
      }));
      setColumnDefs([
        {
          field: 'index',
          pinned: 'left',
          headerName: '',
          valueGetter: (params) => rowIndexToTime(params.node.rowIndex),
          cellRenderer: null,
          cellStyle: null,
          cellClass: null
        },
        ...formattedDates
      ])

      // Generate row data
      const updatedRotaData = []

      for (const day of fetchedRotaData) {
        updatedRotaData.push(day.map(entry => entry.users));
      };

      const rowData = transformColumnSchemaToRowSchema(formattedDates, updatedRotaData);
      setRowData(rowData)

    };
    fetchRotaData();
  }, [branch]);


  const closePopup = () => {
    setSelectedCellData(null);
  };


  return (
    <>
      {isLoading && <Loading />}

      {rowData && (
        <div className='w-full h-full fixed inset-0'>
          <AgGridReact
            onGridReady={handleGridReady}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            className='w-full h-full'
            getRowHeight={() => 13}
            onCellClicked={handleCellClicked}
            gridOptions={{
              theme: gridTheme
            }}
          />
        </div>
      )}

      <CellPopUp selectedCellData={selectedCellData} closePopup={closePopup} />
    </>
  );
};


function CellPopUp({ selectedCellData, closePopup }) {
  return (
    <>
      <AnimatePresence>
        {selectedCellData && (
          <motion.div
            className="fixed inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCellData && (
          <motion.div
            className="pop-up"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Дежурные</h2>
              <button
                className="text-red-500 text-lg font-bold"
                onClick={closePopup}
              >
                ✕
              </button>
            </div>

            <h3 className="text-sm font-medium mb-2 text-gray-500">{format(selectedCellData.date, 'EEEE dd.MM', { locale: ru })}, {rowIndexToTime(selectedCellData.rowIndex)}</h3>

            <div>
              {Object.values(selectedCellData.users).length > 0 ? (
                Object.values(selectedCellData.users).map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 mb-2 bg-gray-100 dark:bg-neutral-700 dark:text-gray-400 rounded-lg">
                    <span className="font-medium">{user.nick}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">В это время нет дежурных</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
