import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { User, Plus } from 'lucide-react';

// API
import handleUpdateRota from '../services/handleUpdateRota';

// Lazy Loading
const UserSearchPopUp = lazy(() => import('./userSearchPopUp'))

export default function RotaHour({ branch, date, timeRange, usersArray, rotaAdmin, maxDuties, initDataUnsafe, setRotaData}) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showSearch]);

  let hourContainerClass = "hour-container";
  if (usersArray.length === 0) {
    hourContainerClass = `hour-container empty ${branch}`
  };


  return (
    <div className={hourContainerClass}>
      <span className="hour-label">{timeRange}</span>
      <div className="usernames-container">
        {usersArray.map((userObj, index) => {
          return (
            <AnimatePresence key={index}>
              <motion.div
                key={index}
                className={`username-box color-${userObj.color}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
              <span>{userObj.nick}</span>

              {rotaAdmin && (
                <button
                  className="ml-2"
                    onClick={() => {
                      handleUpdateRota('remove', branch, date, timeRange, userObj.id, initDataUnsafe)
                        .then((result) => {setRotaData(result)})
                        .catch(() => {});
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }}
                >
                  ✕
                </button>
              )}
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>

      <div className='buttons-container'>
        {rotaAdmin && (
          <button
            className="p-1"
            onClick={() => {
              setShowSearch(true);
              window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }}
          >
            <User size={15} className="icon-text" />
          </button>
        )}

        {date >= today && !(usersArray.some(user => user.id === initDataUnsafe.user.id)) && usersArray.length < maxDuties && (
          <button
            className='p-1'
            onClick={() => {
              handleUpdateRota('add', branch, date, timeRange, initDataUnsafe.user.id, initDataUnsafe)
                .then((result) => {setRotaData(result)})
                .catch(() => {});
              window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }}
          >
              <Plus size={15} className="icon-text"/>
          </button>
        )}
      </div>

    {showSearch && (
      <Suspense fallback={null}>
        <UserSearchPopUp
          mode='rota'
          branch={branch}
          date={date}
          timeRange={timeRange}
          initDataUnsafe={initDataUnsafe}
          setRotaData={setRotaData}
          onClose={() => setShowSearch(false)}
        />
      </Suspense>
    )}

    </div>
  );
};