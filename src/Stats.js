import React, { useEffect, useState } from 'react';
import axios from 'axios';
import catchResponseError from './responseError';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const apiUrl = process.env.REACT_APP_PROXY_URL;

export default function Stats({ branch, setShowStats }){
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statsData, setStatsData] = useState(null);

  // Prefil start and end date
  useEffect(() => {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    const lastDayOfWeek = new Date(today);

    firstDayOfWeek.setDate(today.getDate() - today.getDay() + 1);
    lastDayOfWeek.setDate(today.getDate() - today.getDay() + 7);

    // Format the dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Update state
    setStartDate(formatDate(firstDayOfWeek));
    setEndDate(formatDate(lastDayOfWeek));
  }, []);


  // Telegram UI BackButton
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(() => {setShowStats(false)});
    window.Telegram.WebApp.BackButton.show();

    // Cleanup the event listener when the component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [setShowStats]);


  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const startTime = Date.now();

      try {
        const response = await axios.get(`${apiUrl}/api/stats`, {
          params: {
            branch: branch,
            startDate: startDate,
            endDate: endDate
          }
        });
        setStatsData(response.data);
      } catch (error) {
        catchResponseError(error);
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 300 - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };
    if (startDate !== null){
      fetchStats();
    }
  }, [branch, startDate, endDate]);


    return (
      <div className='flex items-center justify-center w-full h-full fixed inset-0 bg-gray-100 dark:bg-neutral-900'>
        {isLoading ? (
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 dark:border-blue-300"/>
        ) : (
          <div className='w-full h-full overflow-x-auto'>
            <div className='flex my-3 justify-center items-center space-x-5'>
              <input
                  type="date"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                  type="date"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <DataTable value={statsData} sortMode="multiple">
              <Column field="nick" header="Позывной" sortable></Column>
              <Column field="count" header="Смен" sortable></Column>
            </DataTable>
          </div>
        )}
      </div>
  );
};