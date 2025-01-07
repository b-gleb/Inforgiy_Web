import React, { useEffect, useState } from 'react';
import axios from 'axios';
import catchResponseError from '../responseError';

const apiUrl = process.env.REACT_APP_PROXY_URL;

export default function PersonalStats({ user_id }) {
  const [personalStatsData, setPersonalStatsData] = useState(null);

  useEffect(() => {
    const fetchPersonalStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/userStats`, {
          params: {
            user_id: user_id
          }
        });

        setPersonalStatsData(response.data);

      } catch (error) {
        catchResponseError(error);
      }
    };

    fetchPersonalStats();
    setPersonalStatsData({
      currentWeek: 10,
      previousWeek: 5,
      currentMonth: 50,
      previousMonth: 70,
      currentYear: 200
    })
  }, [user_id])


  return (
    <></>
  )
};