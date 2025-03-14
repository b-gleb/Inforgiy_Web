import React, { useEffect } from 'react';
import PersonalStats from './personalStats';
import BranchStats from './branchStats';

export default function Stats({ branch, initDataUnsafe, setShowStats }){
  // Telegram UI BackButton
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(() => {setShowStats(false)});
    window.Telegram.WebApp.BackButton.show();

    // Cleanup the event listener when the component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [setShowStats]);

  return (
    <div className='w-full h-full flex flex-col fixed inset-0 bg-gray-100 dark:bg-neutral-900'>
      <PersonalStats
        branch={branch}
        user_id={initDataUnsafe.user.id}
      />

      <div className='flex-1 overflow-hidden'>
        <BranchStats 
          branch={branch}
          initDataUnsafe={initDataUnsafe}
        />
      </div>
    </div>
  );
};