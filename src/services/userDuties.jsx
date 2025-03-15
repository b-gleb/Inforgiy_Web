import axios from 'axios';
import { format } from 'date-fns';
import catchResponseError from '../utils/responseError';

const apiUrl = import.meta.env.VITE_PROXY_URL;


export default async function userDuties (branch, user_id, startDate, endDate) {
  try {
    const response = await axios.get(`${apiUrl}/api/userDuties`, {
      params: {
        branch: branch,
        user_id: user_id,
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