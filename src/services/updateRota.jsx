import api from './api.js';
import catchResponseError from '../utils/responseError';


export default async function updateRota({type, branch, date, timeRange, modifyUserId, initDataUnsafe}) {
  try {
    const response = await api.post('/api/updateRota', {
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