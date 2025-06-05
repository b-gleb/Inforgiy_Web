import api from './api.js';
import catchResponseError from '../utils/responseError';


export default async function fetchAllUsers(branch, initDataUnsafe) {
  try {
    const response = await api.get('/api/users', {
      params: {
        branch: branch,
        initDataUnsafe: initDataUnsafe
      }
    });

    return response.data;
    
  } catch (error) {
    catchResponseError(error);
    throw error
  }
};