import React from 'react';

export default function Loading () {
  return (
    <div className='flex items-center justify-center fixed inset-0 bg-gray-100 dark:bg-neutral-900 z-40'>
      <div className="fixed animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 dark:border-blue-300 z-50"/>
    </div>
  )
}
