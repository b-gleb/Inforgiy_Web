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
    <div className='overflow-y-auto fixed inset-0 bg-white dark:bg-neutral-900'>
      <div className='flex-1 overflow-hidden'>
        <BranchStats 
          branch={branch}
          initDataUnsafe={initDataUnsafe}
        />
      </div>
    </div>
  );
};