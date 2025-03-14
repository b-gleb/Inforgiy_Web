import axios from 'axios';
import catchResponseError from '../utils/responseError';

const apiUrl = import.meta.env.VITE_PROXY_URL;


export default async function fetchAllUsers(branch, initDataUnsafe) {
  try {
    const response = await axios.get(`${apiUrl}/api/users`, {
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