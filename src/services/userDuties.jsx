import api from './api.js';
import { format } from 'date-fns';
import catchResponseError from '../utils/responseError';

export default async function userDuties (branch, userId, startDate, endDate) {
  try {
    const response = await api.get('/api/userDuties', {
      params: {
        branch: branch,
        userId: userId,
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