import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import catchResponseError from './responseError';
import './WeeklyView.css';

const apiUrl = process.env.REACT_APP_PROXY_URL;

export default function WeeklyView({ branch, initDataUnsafe, setShowWeekly }) {
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDates] = useState([]);
  const [rotaData, setRotaData] = useState([]);
  const [selectedCellData, setSelectedCellData] = useState(null);

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

  // Telegram UI BackButton
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(() => {setShowWeekly(false)});
    window.Telegram.WebApp.BackButton.show();

    // Cleanup the event listener when the component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [setShowWeekly]);


  useEffect(() => {
    const fetchRotaData = async () => {
      setIsLoading(true);
      const startTime = Date.now();

      const newRotaData = [];
      const days = getDays();
      setDates(days);

      for (const day of days) {
        try {
          const response = await axios.get(`${apiUrl}/api/rota`, {
            params: {
              branch: branch,
              date: format(day, 'yyyy-MM-dd')
            }
          });
          newRotaData.push(response.data);
        } catch (error) {
          catchResponseError(error);
          newRotaData.push({}); // Push empty data for that day to avoid breaking the table
        }
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 300 - elapsedTime);

      setTimeout(() => {
        setRotaData(newRotaData);
        setIsLoading(false);
      }, remainingTime);
    };
    fetchRotaData();
  }, [branch]);


  const renderUserDivs = (branch, hourData) => {
    const nicks = Object.values(hourData).map(user => user.nick.split(' ')[0]).join(', ');

    return (
      <p className='text-[8px] dark:text-gray-300'>{nicks}</p>
    );
  };


  const renderTableHeader = () => {
    return (
      <thead>
        <tr>
          <th className='cell header sticky left-0 w-[12vw]'>
            <button onClick={() => setShowWeekly(false)}>✕</button>
          </th>
          {dates.map((day, index) => (
            <th className='cell header' key={index}>
              {`${String(day.getDate()).padStart(2, '0')}.${String(day.getMonth() + 1).padStart(2, '0')}`} {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
            </th>
          ))}
        </tr>
      </thead>
    );
  };


  const renderTableBody = (branch, initDataUnsafe) => {
    const timeSlots = rotaData.length > 0 ? Object.keys(rotaData[0]) : [];
  
    return (
      <tbody>
        {timeSlots.map((timeSlot, rowIndex) => (
          <tr key={rowIndex}>
            <td className='cell header sticky left-0'>
              {timeSlot.split('-')[0]}
            </td>
  
            {rotaData.map((dayData, colIndex) => {
              const isSelfUser = dayData[timeSlot].some(user => user.id === initDataUnsafe.user.id);
  
              return (
                <td
                  key={colIndex}
                  className={`cell ${dayData[timeSlot] ? (Object.keys(dayData[timeSlot]).length > 0 ? 'full' : 'empty') : 'empty'} ${branch} ${isSelfUser ? '!bg-gray-300 dark:!bg-[#878787]' : ''}`}
                  onClick={() => {
                    setSelectedCellData({duties: dayData[timeSlot], date: dates[colIndex], time: timeSlot});
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                  }}
                >
                  {dayData[timeSlot] ? renderUserDivs(branch, dayData[timeSlot]) : null}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    );
  };

  const closePopup = () => {
    setSelectedCellData(null);
  };

  const containerHeight = 365;
  const tableHeight = 300;
  const translationY = (containerHeight - tableHeight * 0.85) / 2;

  return (
    <div className='flex items-center justify-center w-full h-full fixed inset-0 bg-gray-100 dark:bg-neutral-900'>
      {isLoading ? (
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 dark:border-blue-300"/>
      ) : (
        <TransformWrapper
          initialScale={0.85}
          minScale={0.3}
          maxScale={1.5}
          initialPositionY={translationY}
          disablePadding={true}
          wheel={{
            step: 0.1,
          }}
          panning={{
            lockAxisY: true
          }}
        >
          <TransformComponent>
            <div className='w-full h-full overflow-x-auto'>
              <table className='table-auto border-collapse w-full h-full'>
                {renderTableHeader()}
                {renderTableBody(branch, initDataUnsafe)}
              </table>
            </div>
          </TransformComponent>
        </TransformWrapper>
      )}

      <CellPopUp selectedCellData={selectedCellData} closePopup={closePopup} />
    </div>
  );
};


function CellPopUp({ selectedCellData, closePopup }) {
  return (
    <>
      <AnimatePresence>
        {selectedCellData && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

            <h3 className="text-sm font-medium mb-2 text-gray-500">{selectedCellData.date.toLocaleDateString('ru-RU', { weekday: 'long' })}, {selectedCellData.time}</h3>

            <div>
              {Object.values(selectedCellData.duties).length > 0 ? (
                Object.values(selectedCellData.duties).map((user, index) => (
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
