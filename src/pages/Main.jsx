import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

// Custom components
import BranchSelector from '@/components/BranchSelector';
import PageSelector from '@/components/PageSelector';
import RotaHour from '@/pages/rota/Rota.jsx';
import UserDutiesContainer from './rota/components/UserDuties/UserDutiesContainer';
import Loading from '@/components/loading.jsx';
import catchResponseError from '@/utils/responseError.jsx';

// API
import { useRota } from '@/hooks/rotaHooks';
import { getAuth } from '@/services/api.ts';

// CSS
import '@/styles/App.css';

// Lazy Loading
const UserSearchPopUp = lazy(() => import('@/components/userSearchPopUp.jsx'));
const PersonalStats = lazy(() => import('@/pages/statistics/personal/PersonalStats.jsx'));
const Lottie = lazy(() => import("lottie-react"));


function Main() {
  const navigate = useNavigate();
  const location = useLocation();

  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [rotaAdmin, setRotaAdmin] = useState([]);
  const [date, setDate] = useState(sessionStorage.getItem('date') || format(new Date(), 'yyyy-MM-dd'));
  const [userBranches, setUserBranches] = useState(null);
  const [branch, setBranch] = useState(sessionStorage.getItem('branch'));
  const [isLoading, setIsLoading] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showForbidden, setShowForbidden] = useState(false);
  const [showRota, setShowRota] = useState(true);
  const [showStatDropdown, setShowStatDropdown] = useState(false);
  const [showPersonalStats, setShowPersonalStats] = useState(false);
  const isFirstMount = useRef(true);
  const [swipeDirection, setSwipeDirection] = useState('left');

  // Animations
  const [animationDataForbidden, setAnimationDataForbidden] = useState(null);
  const [animationDataShrug, setAnimationDataShrug] = useState(null);
  // TODO: rework
  useEffect(() => {
    if (!showForbidden) return;

    const controller = new AbortController();

    import("@/assets/denied.json").then(module => {
      if (!controller.signal.aborted) {
        setAnimationDataForbidden(module.default);
      }
    });

    return () => controller.abort();
  }, [showForbidden]);

  const { 
    data: rotaData,
    isLoading: isRotaLoading,
    isError: isRotaError,
    error: rotaError,
  } = useRota({ branch, date });

  const { data: secondaryRotaData } = useRota(
    { branch: 'gp', date },
    { enabled: branch === 'di'}
  );

  useEffect(() => {
    if (rotaError?.status !== 404) return;

    const controller = new AbortController();

    import("@/assets/shrug.json").then(module => {
      if (!controller.signal.aborted) {
        setAnimationDataShrug(module.default);
      }
    });

    return () => controller.abort();
  }, [rotaError]);


  // Prevent page refresh to trigger main page opening with the wrong state
  useEffect(() => {
    const { showUserManagement, ...rest } = location.state || {};    

    if (showUserManagement) {
      setShowUserManagement(showUserManagement);
    }

    if (showUserManagement) {
      navigate(location.pathname, {
        replace: true,
        state: rest,
      });
    }
  }, [navigate, location.state]);


  // Prevent main page from scorlling when a pop-up is open on top
  useEffect(() => {
    if (showUserManagement || showPersonalStats || showForbidden) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showUserManagement, showPersonalStats, showForbidden]);


  useEffect(() => {
    const handleBackClick = () => {
      setShowPersonalStats(false);
    };

    if (showPersonalStats) {
      window.Telegram.WebApp.BackButton.onClick(handleBackClick);
      window.Telegram.WebApp.BackButton.show();
    }
    else {
      window.Telegram.WebApp.BackButton.offClick(handleBackClick);
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [showPersonalStats]);


  const storeLastLogin = () => {
    const currentDateTime = new Date().toISOString();
    window.Telegram.WebApp.CloudStorage.setItem("lastLogin", currentDateTime, (err, success) => {
      if (err) {
        console.error("Error storing last login:", err);
      } else if (success) {
        console.log("Last login time successfully stored:", currentDateTime);
      }
    });
  };

  
  useEffect(() => {
    if (! window.Telegram.WebApp){
      console.warn('Telegram WebApp is not avaliable')
      return
    } else if (Object.keys(window.Telegram.WebApp.initDataUnsafe).length === 0) {
      console.log('Using mock Telegram data');
      console.log(import.meta.env.VITE_INIT_DATA_UNSAFE);
      sessionStorage.setItem('theme', 'light');
      setInitDataUnsafe(JSON.parse(import.meta.env.VITE_INIT_DATA_UNSAFE));
    } else {
      console.log('Using real Telegram data');
      sessionStorage.setItem('theme', window.Telegram.WebApp.colorScheme);
      setInitDataUnsafe(window.Telegram.WebApp.initDataUnsafe);
      window.Telegram.WebApp.disableVerticalSwipes();
      window.Telegram.WebApp.expand();
      storeLastLogin();
    }
  }, []);


  useEffect(() => {
    let showLoadingTimeout;
    let minimumLoadingTimer;

    if (userBranches === null) {
      // Start a timeout to delay showing the loader
      showLoadingTimeout = setTimeout(() => {setIsLoading(true)}, 170);
    } else {
      if (isLoading) {
        clearTimeout(minimumLoadingTimer);
        setTimeout(() => setIsLoading(false), 1000);
      } else {
        clearTimeout(showLoadingTimeout);
      }
    }

    return () => {
      clearTimeout(showLoadingTimeout);
      clearTimeout(minimumLoadingTimer);
    };
  }, [userBranches, isLoading]);


  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await getAuth({initDataUnsafe});

        setRotaAdmin(response.data.rotaAdmin);
        setUserBranches(response.data.branches);

        if (sessionStorage.getItem('branch') === null) {
          setBranch(Object.keys(response.data.branches)[0]);
          sessionStorage.setItem('branch', Object.keys(response.data.branches)[0]);
        }
      }
      catch (error) {
        if (error.response.status === 404 || error.response.status === 403){
          setShowForbidden(true);
        } else {
          catchResponseError(error);
        }
      }
    };

    if (initDataUnsafe !== null){
      fetchAuthData()
    };
  }, [initDataUnsafe]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const newDate = format(addDays(new Date(date), 1), 'yyyy-MM-dd');
      setDate(newDate);
      sessionStorage.setItem('date', newDate);
      setSwipeDirection('left');
      setShowRota(false);
      setTimeout(() => {
        setShowRota(true);
      }, 400);
      isFirstMount.current = false;
    },

    onSwipedRight: () => {
      const newDate = format(addDays(new Date(date), -1), 'yyyy-MM-dd');
      setDate(newDate);
      sessionStorage.setItem('date', newDate);
      setSwipeDirection('right');
      setShowRota(false);
      setTimeout(() => {
        setShowRota(true);
      }, 400);
      isFirstMount.current = false;
    },
    delta: 75,
  });


  const animationVariants = {
    initial: (direction) => (isFirstMount.current ? false : {
      x: direction === 'left' ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: (direction) => ({
      x: direction === 'left' ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    }),
  };


  return (
    <div className={`app ${sessionStorage.getItem('theme') || 'light'}`}>
      <h1 className='text-3xl font-bold mb-2 dark:text-slate-100'>График</h1>

      {isLoading && <Loading />}

      {!isLoading && userBranches && (
        <>
          {Object.keys(userBranches).length >= 2 && (
            <BranchSelector 
              userBranches={userBranches}
              branch={branch}
              onClick={(key) => {
                setBranch(key);
                sessionStorage.setItem('branch', key);
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
              }}
            />
          )}

          <PageSelector 
            date={date}
            onDateChange={(newDate) => {
              setDate(newDate);
              sessionStorage.setItem('date', newDate);
            }}
            branch={branch}
            isRotaAdmin={rotaAdmin.includes(branch)}
            userBranches={userBranches}
            initDataUnsafe={initDataUnsafe}
            navigate={navigate}
            showStatDropdown={showStatDropdown}
            setShowStatDropdown={setShowStatDropdown}
            onShowPersonalStats={() => setShowPersonalStats(true)}
            onShowUserManagement={() => {
              setShowUserManagement(true);
              window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }}
          />
        </>
      )}

      <UserDutiesContainer 
        branch={branch}
        userId={initDataUnsafe?.user?.id ?? null}
      />

      {userBranches !== null && (
        // TODO: Add loading screen
        isRotaLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="dark:text-white">Загрузка...</p>
          </div>
        ) : isRotaError ? (
          <Suspense fallback={null}>
            <div className='size-7/12 mx-auto'>
              <Lottie animationData={animationDataShrug} />
              <p className='text-center dark:text-white'>
                График за этот день недоступен :(
              </p>
            </div>
          </Suspense>
        ) : (
          <AnimatePresence custom={swipeDirection}>
            {showRota && (
              <motion.div 
                {...swipeHandlers}
                className='hours-grid'
                key={date}
                custom={swipeDirection}
                variants={animationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* FIXME: something here sometimes fails and the whole rota goes blank */}
                {(rotaData ?? []).map((dutyHour, index) => (
                  <RotaHour
                    key={index}
                    branch={branch}
                    date={date}
                    dutyHour={dutyHour}
                    secondaryDutyHour={branch === "di" ? secondaryRotaData[index] : undefined}
                    rotaAdmin={rotaAdmin.includes(branch)}
                    maxDuties={userBranches[branch].maxDuties}
                    initDataUnsafe={initDataUnsafe}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )
      )}

      {showForbidden && (
        <Suspense fallback={null}>
          <div className='popup flex justify-center items-center'>
            <div className='w-[50%]'>
              <Lottie animationData={animationDataForbidden} />
              <p className='text-center dark:text-white'>Недостаточно прав!</p>
            </div>
          </div>
        </Suspense>
      )}

      {showUserManagement && (
        <Suspense fallback={null}>
          <UserSearchPopUp
            mode='user_management'
            branch={branch}
            initDataUnsafe={initDataUnsafe}
            onClose={() => setShowUserManagement(false)}
          />
        </Suspense>
      )}

      {showPersonalStats && (
        <Suspense fallback={null}>
          <div className='popup'>
            <PersonalStats
              branch={branch}
              userId={initDataUnsafe.user.id}
            />
          </div>
        </Suspense>
      )}
  </div>
  );
}

export default Main;
