import axios from 'axios';
const apiUrl = import.meta.env.VITE_PROXY_URL;

const api = axios.create({
  baseURL: apiUrl
});

type Branch = 'lns' | 'gp' | 'di' | 'ryaz' | 'orel';
type UserId = number;
type ISODate = `${number}-${number}-${number}`;
type InitDataUnsafe = object;

// //// //
// ROTA //
// //// //

export const getRota = async (
  branch: Branch,
  date: ISODate
) => {
  const response = await api.get('/api/rota', {
    params: {
      branch,
      date
    }
  });
  return response.data;
};

export const getUserDuties = async (
  branch: Branch,
  userId: UserId,
  startDate: ISODate,
  endDate: ISODate
) => {
  const response = await api.get('/api/userDuties', {
    params: {
      branch,
      userId,
      startDate,
      endDate
    }
  });

  return response.data;
};

// ///// //
// USERS //
// ///// //

export const getUsers = async (
  branch: Branch,
  initDataUnsafe: InitDataUnsafe
) => {
  const response = await api.post('api/users', 
    { branch, initDataUnsafe }
  );

  return response.data;
}

export default api;