import { useEffect, useState, Suspense, lazy } from 'react';
import UserBox from '@/pages/rota/components/UserBox/UserBox';
import { format } from 'date-fns';
import { User, Plus } from 'lucide-react';

// API
import { useUpdateRota } from '@/hooks/rotaHooks';

// Lazy Loading
const UserSearchPopUp = lazy(() => import('@/components/userSearchPopUp'))

export default function RotaHour({ branch, date, dutyHour, secondaryDutyHour, rotaAdmin, maxDuties, initDataUnsafe}) {
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
        {dutyHour.users.map((userObj) => (
          <UserBox
            key={userObj.id}
            userObj={userObj}
            rotaAdmin={rotaAdmin}
            onRemove={() =>
              updateRota(
                {
                  type: "remove",
                  branch,
                  date,
                  timeRange: dutyHour.label,
                  userId: userObj.id,
                  initDataUnsafe,
                },
                {
                  onSuccess: () => {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
                  },
                }
              )
            }
          />
        ))}
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
            onClose={() => setShowSearch(false)}
          />
        </Suspense>
      )}

    </div>
  );
};