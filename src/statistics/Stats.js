import React, { useEffect } from 'react';
import BranchStats from './branchStats';

export default function Stats({ branch, setShowStats }){
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
    <BranchStats 
      branch={branch}
    />
  );
};