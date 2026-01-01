import { useEffect, useState } from 'react';

// API
import api from '../../services/api.js';
import catchResponseError from '../../utils/responseError';

export default function BranchSummaryStats({ branch }) {
  return (
    <></>
  );
};

const StatCard = ({ label, sublabel, current, previous }) => {
  const showComparison = previous !== undefined && previous !== null;
  const isPositive = showComparison && current > previous;
  const change = showComparison ? current - previous : 0;

  return (
    <div className="flex-1 p-2 rounded-2xl shadow-md bg-white dark:bg-neutral-800">
      <h3 className="text-base font-semibold mb-2 text-gray-500 dark:text-gray-400">{label}</h3>
      {current === null ? (
        <div className="animate-pulse">
          <div className="h-10 rounded-sm w-3/4 mb-2 bg-gray-200 dark:bg-neutral-700"></div>
          <div className="h-4 rounded-sm w-1/2 bg-gray-200 dark:bg-neutral-700"></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{current}</div>
          {showComparison && (
            <div className="flex items-center">
              <span className={`text-[0.6rem] ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}
              </span>
              <span className="text-[0.6rem] ml-1 text-gray-500 dark:text-gray-400">{sublabel}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};