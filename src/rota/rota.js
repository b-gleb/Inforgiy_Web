import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { User, Plus } from 'lucide-react';

// API
import updateRota from '../services/updateRota';

// Lazy Loading
const UserSearchPopUp = lazy(() => import('./userSearchPopUp'))

export default function RotaHour({ branch, date, dutyHour, rotaAdmin, maxDuties, initDataUnsafe, setRotaData}) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [showSearch, setShowSearch] = useState(false);

  let hourContainerClass = "hour-container";
  if (dutyHour.users.length === 0) {
    hourContainerClass = `hour-container empty ${branch}`
  };

  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showSearch]);


  return (
    <div className={hourContainerClass}>
      <span className="hour-label">{dutyHour.label}</span>
      <div className="usernames-container">
        {dutyHour.users.map((userObj, index) => {
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
                      updateRota('remove', branch, date, dutyHour.label, userObj.id, initDataUnsafe)
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

        {date >= today && !(dutyHour.users.some(user => user.id === initDataUnsafe.user.id)) && dutyHour.users.length < maxDuties && (
          <button
            className='p-1'
            onClick={() => {
              updateRota('add', branch, date, dutyHour.label, initDataUnsafe.user.id, initDataUnsafe)
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
          timeRange={dutyHour.label}
          initDataUnsafe={initDataUnsafe}
          setRotaData={setRotaData}
          onClose={() => setShowSearch(false)}
        />
      </Suspense>
    )}

    </div>
  );
};