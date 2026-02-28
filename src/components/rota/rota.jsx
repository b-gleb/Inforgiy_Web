import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { User, Plus } from 'lucide-react';

// API
import { useUpdateRota } from '@/hooks/rotaHooks';

// Lazy Loading
const UserSearchPopUp = lazy(() => import('@/components/userSearchPopUp'))

export default function RotaHour({ branch, date, dutyHour, secondaryDutyHour, rotaAdmin, maxDuties, initDataUnsafe, setRotaData}) {
  const {mutate: updateRota} = useUpdateRota();
  // TODO: today and display logic it trigers needs to be moved out of the component
  const today = format(new Date(), 'yyyy-MM-dd');
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
      <div className='flex flex-col'>
        <span className="hour-label">{dutyHour.label}</span>

        {secondaryDutyHour !== undefined && secondaryDutyHour.users.length > 0 && date === today && (
          <div className='flex gap-1'>
            {secondaryDutyHour.users.map((userObj, index) => {
              return (
                <div
                  key={index}
                  className={`user-box color-${userObj.color}`}
                />
              )
            })}
          </div>
        )}
      </div>

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
                      updateRota(
                        {
                          type: 'remove',
                          branch,
                          date,
                          timeRange: dutyHour.label,
                          userId: userObj.id,
                          initDataUnsafe
                        },
                        {
                          onSuccess: (data, variable, context) => {
                            setRotaData(data);
                            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                          }
                        }
                      )
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
              updateRota(
                {
                  type: 'add',
                  branch,
                  date,
                  timeRange: dutyHour.label,
                  userId: initDataUnsafe.user.id,
                  initDataUnsafe
                },
                {
                  onSuccess: (data, variables, context) => {
                    setRotaData(data);
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                  }
                }
              )
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