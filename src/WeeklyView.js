import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiUrl = process.env.REACT_APP_PROXY_URL;

//TODO: Move catchResponseError to separate file
function catchResponseError(error){
    console.error(error.code, error.status,  error.response.data);
    toast.error(`ERROR ${error.status}: ${error.response.data}`);
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
}

export default function WeeklyView({ branch, setShowWeekly }){
    const [dates, setDates] = useState([]);
    const [rotaData, setRotaData] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
  
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
          <div key={index} className='w-2 h-2 rounded-sm bg-blue-500'></div>
        ))}
      </div>
    )
  
  
    // return (
    //   <div className='flex'>
    //     Object.values(hourData).map((user, index) => (
    //       <div key={index} className={`level-${user.level} w-2 h-2 rounded-sm bg-blue-600`}></div>
    //     )
    //   </div>
    //   ));
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
    console.log(rotaData)
  
    return (
      <tbody>
        {timeSlots.map((timeSlot, rowIndex) => (
          <tr key={rowIndex}>
            <td className='border border-gray-300 bg-gray-200 text-xs p-1 text-center'>
              {timeSlot.split('-')[0]}
            </td>
  
            {rotaData.map((dayData, colIndex) => (
              <td key={colIndex} className={`border border-gray-300 p-1 ${Object.keys(dayData[timeSlot]).length > 0 ? 'bg-white' : 'bg-red-100'}`}>
                {dayData[timeSlot] ? renderUserDivs(dayData[timeSlot]) : null}
              </td>
            ))}
  
          </tr>
        ))}
      </tbody>
    );
  };
  
  return (
      <div className='w-screen fixed inset-0'>
          {isLoading ? <div className="w-full h-full bg-red-950">Loading...</div> : (
            <table className='w-full h-full table-fixed'>
                {renderTableHeader()}
                {renderTableBody()}
            </table>
          )}
      </div>
  );
  };