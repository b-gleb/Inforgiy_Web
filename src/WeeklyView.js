import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const apiUrl = process.env.REACT_APP_PROXY_URL;

//TODO: Move catchResponseError to separate file
function catchResponseError(error){
    console.error(error.code, error.status,  error.response.data);
    toast.error(`ERROR ${error.status}: ${error.response.data}`);
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
}

export default function WeeklyView({ branch, setShowWeekly }){
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDates] = useState([]);
  const [rotaData, setRotaData] = useState([]);
  const [selectedCellData, setSelectedCellData] = useState(null);
  
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date)
    }
    return days;
  };
  
  useEffect(() => {
    const fetchRotaData = async () => {
      const newRotaData = [];
      const days = getNext7Days();
      setDates(days);

      const timer = setTimeout(() => setIsLoading(true), 50); // Delay showing loading spinner to prevent flickering
        
      for (const day of days) {
          try {
              const response = await axios.get(`${apiUrl}/api/rota`, {
                params: {
                  branch: branch,
                  date: day.toISOString().split("T")[0]
                }
              });
              newRotaData.push(response.data);
          } catch (error) {
              catchResponseError(error);
              newRotaData.push({}); // Push empty data for that day to avoid breaking the table
          }
      }
      clearTimeout(timer);
      setIsLoading(false);
      setRotaData(newRotaData);
    };
    fetchRotaData();
  }, [branch]);
  
  
  const renderUserDivs = (hourData) => {
    return (
      <div className='flex gap-1'>
        {Object.values(hourData).map((user, index) => (
          <div key={index} className={`w-2 h-2 rounded-sm color-${user.color}`}></div>
        ))}
      </div>
    )
  };
  
  
  const renderTableHeader = () => {
    return (
      <thead>
        <tr>
          <th className='border border-gray-300 bg-gray-200 text-xs p-1'>
            <button onClick={() => setShowWeekly(false)}>✕</button>
          </th>
          {dates.map((day, index) => (
              <th
                className='border border-gray-300 bg-gray-200 text-xs p-1'
                key={index}
              >
                {`${String(day.getDate()).padStart(2, '0')}.${String(day.getMonth() + 1).padStart(2, '0')}`} {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </th>
          ))}
        </tr>
      </thead>
    );
  };
  
  const renderTableBody = () => {
    const timeSlots = rotaData.length > 0 ? Object.keys(rotaData[0]) : [];
  
    return (
      <tbody>
        {timeSlots.map((timeSlot, rowIndex) => (
          <tr key={rowIndex}>
            <td className='border border-gray-300 bg-gray-200 text-xs p-1 text-center'>
              {timeSlot.split('-')[0]}
            </td>
  
            {rotaData.map((dayData, colIndex) => (
              <td
                key={colIndex}
                className={`border border-gray-300 p-1 ${Object.keys(dayData[timeSlot]).length > 0 ? 'bg-white' : 'bg-red-100'}`}
                onClick={() => setSelectedCellData(dayData[timeSlot] || {})}
              >
                  {dayData[timeSlot] ? renderUserDivs(dayData[timeSlot]) : null}
              </td>
            ))}
  
          </tr>
        ))}
      </tbody>
    );
  };


const closePopup = () => {
  setSelectedCellData(null);
};
  
  return (
    <div className='w-screen fixed inset-0'>
        {isLoading ? <div className="w-full h-full bg-red-950">Loading...</div> : (
          <table className='w-full h-full table-fixed'>
              {renderTableHeader()}
              {renderTableBody()}
          </table>
        )}

      {/* Dark Overlay */}
      {selectedCellData && <DarkOverlay closePopup={closePopup}/>}


      {/* Slide-in Pop-up */}
      {selectedCellData && <CellPopUp selectedCellData={selectedCellData} closePopup={closePopup}/>}

    </div>
  );
};

function DarkOverlay({ closePopup }) {
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closePopup}
      />
    </AnimatePresence>
  )
}

function CellPopUp({ selectedCellData, closePopup }) {
  return(
    <AnimatePresence>
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg p-6 max-h-[70%] overflow-y-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Users on Duty</h2>
            <button 
              className="text-red-500 text-lg font-bold"
              onClick={closePopup}
            >
              ✕
            </button>
          </div>

          <div>
            {Object.values(selectedCellData).length > 0 ? (
                Object.values(selectedCellData).map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 mb-2 bg-gray-100 rounded-lg">
                    <span className="font-medium">{user.username}</span>
                    <span className={`text-sm text-gray-500`}>Level: {user.level ?? 'N/A'}</span>
                  </div>
                ))
            ) : (
                <p className="text-center text-gray-500">No users on duty for this time slot.</p>
            )}

          </div>
        </motion.div>
      </AnimatePresence>
  )
}