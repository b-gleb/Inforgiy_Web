import axios from 'axios';
import catchResponseError from '../utils/responseError';

const apiUrl = process.env.REACT_APP_PROXY_URL;


export default async function handleUpdateRota(type, branch, date, timeRange, modifyUserId, initDataUnsafe) {
  try {
    const response = await axios.post(`${apiUrl}/api/updateRota`, {
      type: type,
      branch: branch,
      date: date,
      timeRange: timeRange,
      modifyUserId: modifyUserId,
      initDataUnsafe: initDataUnsafe
    });
    
    return response.data;

  } catch (error) {
    catchResponseError(error);
    throw error;
  }
};