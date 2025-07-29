import api from './api.js';
import { format } from 'date-fns';
import catchResponseError from '../utils/responseError';


export default async function userDuties (branch, user_id, startDate, endDate) {
  try {
    const response = await api.get('/api/userDuties', {
      params: {
        branch: branch,
        userId: user_id,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      }
    });

    return response.data;

  } catch (error) {
      catchResponseError(error);
      throw error;
  }
};