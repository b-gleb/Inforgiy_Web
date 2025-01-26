import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import catchResponseError from '../responseError';


const apiUrl = process.env.REACT_APP_PROXY_URL;

export default function BranchStats({ branch, initDataUnsafe }) {
  const [isLoading, setIsLoading] = useState(true);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState(null);
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/users`, {
        params: {
          branch: branch,
          initDataUnsafe: initDataUnsafe
        }
      });

      return response.data.map((userObj) => userObj.id);
    } catch (error) {
      catchResponseError(error);
    }
  };

  const fetchBranchData = async (user_ids) => {
    try {
      const response = await axios.post(`${apiUrl}/api/stats`, {
        branch: branch,
        user_ids: user_ids,
        dateRanges: [["2025-01-01", "2025-01-31"], ["2025-02-01", "2025-02-28"]]
      });

      return response.data;
    } catch (error) {
      catchResponseError(error);
    }
  };

  useEffect(() => {
    const fetchBranchStats = async () => {
      const allUserIds = await fetchAllUsers();
      const branchData = await fetchBranchData(allUserIds);

      console.log(branchData);


    fetchBranchStats();
    setIsLoading(false);
  }, [])


  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 dark:border-blue-300"/>
      ) : (
        <div className='h-full w-full'>
        </div>
      )}
    </>
  );
};