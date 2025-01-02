import axios from 'axios';
import catchResponseError from '../responseError';

const apiUrl = process.env.REACT_APP_PROXY_URL;

export const handleUpdateRota = async (type, branch, date, timeRange, modifyUserId, initDataUnsafe, setRotaData) => {
    try {
      const response = await axios.post(`${apiUrl}/api/updateRota`, {
        type: type,
        branch: branch,
        date: date,
        timeRange: timeRange,
        modifyUserId: modifyUserId,
        initDataUnsafe: initDataUnsafe
      });
  
      console.log(typeof response)
      setRotaData(response.data);
      console.log('new rota data')
    } catch (error) {
      catchResponseError(error);
    }
  };