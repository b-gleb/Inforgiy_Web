import axios from 'axios';
const apiUrl = import.meta.env.VITE_PROXY_URL;

const api = axios.create({
  baseURL: apiUrl
});

type Branch = 'lns' | 'gp' | 'di' | 'ryaz' | 'orel';
type UserId = number;
type ISODate = `${number}-${number}-${number}`;
type DateRange = ISODate[];
type InitDataUnsafe = object;

// //// //
// ROTA //
// //// //

export const getRota = async (params: {
  branch: Branch;
  date: ISODate;
}) => {
  const response = await api.get('/api/rota', { params });
  return response.data;
};

export const getUserDuties = async (params: {
  branch: Branch;
  userId: UserId;
  startDate: ISODate;
  endDate: ISODate;
}) => {
  const response = await api.get('/api/userDuties', { params });
  return response.data;
};

// ///// //
// USERS //
// ///// //

export const getUsers = async (params: {
  branch: Branch;
  initDataUnsafe: InitDataUnsafe;
}) => {
  const response = await api.post('/api/users', params);

  return response.data;
}

// ///// //
// STATS //
// ///// //

export const getStats = async (params: {
  branch: Branch;
  userIds: UserId[];
  dateRanges: DateRange[];
}) => {
  const response = await api.post('/api/stats', params);
  return response.data;
};

export const getStatsCumulative = async (params: {
  branch: Branch;
  userId: UserId;
  dateRanges: DateRange[];
}) => {
  const response = await api.post('/api/stats/cumulative', params);
  return response.data;
}

export default api;