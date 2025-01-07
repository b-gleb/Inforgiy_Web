import React, { useEffect } from 'react';
import PersonalStats from './personalStats';
import BranchStats from './branchStats';

export default function Stats({ branch, user_id, setShowStats }){
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
    <>
      <PersonalStats 
        user_id={user_id}
      />

      <BranchStats 
        branch={branch}
      />
    </>
  );
};