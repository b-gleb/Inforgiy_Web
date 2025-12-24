import axios from 'axios';
const apiUrl = import.meta.env.VITE_PROXY_URL;

const api = axios.create({
  baseURL: apiUrl
});

type Branch = 'lns' | 'gp' | 'di' | 'ryaz' | 'orel';
type ISODate = `${number}-${number}-${number}`;

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

export default api;