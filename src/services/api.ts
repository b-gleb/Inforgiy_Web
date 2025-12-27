import axios from 'axios';
import catchResponseError from '@/utils/responseError';
const apiUrl = import.meta.env.VITE_PROXY_URL;

const api = axios.create({
  baseURL: apiUrl
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    catchResponseError(error);
    return Promise.reject(error);
  }
);

type Branch = 'lns' | 'gp' | 'di' | 'ryaz' | 'orel';
type UserId = number;
type ISODate = `${number}-${number}-${number}`;
type DateRange = ISODate[];
type InitDataUnsafe = object;

interface UserObj {
  id: UserId;
  username: string;
  nick: string;
  color: number;
};

// /////// //
// DEFAULT //
// /////// //
export const getAuth = async (params: {
  initDataUnsafe: InitDataUnsafe;
}) => {
  const response = await api.post('/api/auth', params);
  return response;
};

// //// //
// ROTA //
// //// //

export const getRota = async (params: {
  branch: Branch;
  date: ISODate;
}) => {
  const response = await api.get('/api/rota', { params });
  return response;
};

export const getUserDuties = async (params: {
  branch: Branch;
  userId: UserId;
  startDate: ISODate;
  endDate: ISODate;
}) => {
  const response = await api.get('/api/userDuties', { params });
  return response;
};

export const updateRota = async (params: {
  type: string;
  branch: Branch;
  date: ISODate;
  timeRange: string;
  userId: UserId;
  initDataUnsafe: InitDataUnsafe;
}) => {
  const response = await api.post('/api/updateRota', params);
  return response;
};

// ///// //
// USERS //
// ///// //

export const getUsers = async (params: {
  branch: Branch;
  initDataUnsafe: InitDataUnsafe;
}) => {
  const response = await api.post('/api/users', params);
  return response;
};

export const updateUser = async (params: {
  branch: Branch;
  userObj: UserObj;
  initDataUnsafe: InitDataUnsafe;
}) => {
  const response = await api.post('/api/updateUser', params);
  return response;
};

export const removeUser = async (params: {
  branch: Branch;
  userId: UserId;
  initDataUnsafe: InitDataUnsafe;
}) => {
  const response = await api.post('/api/removeUser', params);
  return response;
};

// ///// //
// STATS //
// ///// //

export const getStats = async (params: {
  branch: Branch;
  userIds: UserId[];
  dateRanges: DateRange[];
}) => {
  const response = await api.post('/api/stats', params);
  return response;
};

export const getStatsCumulative = async (params: {
  branch: Branch;
  userId: UserId;
  dateRanges: DateRange[];
}) => {
  const response = await api.post('/api/stats/cumulative', params);
  return response;
};

export default api;