import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import api from '@/services/api.js';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, CalendarDays, ChartNoAxesCombined } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { Button } from '@/components/ui/button.jsx';

// Custom components
import BranchSelector from '@/components/BranchSelector';
import RotaHour from '@/components/rota/rota.jsx';
import MyDutiesCard from '@/components/rota/myDuties.jsx';
import Loading from '@/components/loading.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Separator } from "@/components/ui/separator";
import catchResponseError from '@/utils/responseError.jsx';

// CSS
import '@/styles/App.css';
import 'react-toastify/dist/ReactToastify.css';

// Animations
import shrugAnimationData from "@/assets/shrug.json";
import deniedAnimationData from "@/assets/denied.json";

// Lazy Loading
const UserSearchPopUp = lazy(() => import('@/components/rota/userSearchPopUp.jsx'));
const PersonalStats = lazy(() => import('@/components/statistics/personalStats.jsx'));
const Animation = lazy(() => import('@/components/animation.jsx'));


function Main() {
  const navigate = useNavigate();
  const location = useLocation();

  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [rotaData, setRotaData] = useState([]);
  const [secondaryRotaData, setSecondaryRotaData] = useState([]);
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


  // Prevent page refresh to trigger main page opening with the wrong state
  useEffect(() => {
    const { showUserManagement, toastMessage, ...rest } = location.state || {};    

    if (showUserManagement) {
      setShowUserManagement(showUserManagement);
    }

    if (toastMessage){
      toast.success(toastMessage);
    }

    if (showUserManagement || toastMessage) {
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
        const response = await api.post('/api/auth', {initDataUnsafe});

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

  
  useEffect(() => {
    const fetchRotaData = async () => {
      // Prevent fetching data on mount when branch is not defined
      if (branch === null) {
        return
      }

      try {
        const response = await api.get('/api/rota', {
          params: {
            branch: branch,
            date: date,
          },
        });
        setRotaData(response.data);

        if (branch === 'di') {
          const responseSecondary = await api.get('/api/rota', {
            params: {
              branch: 'gp',
              date: date,
            },
          });
          setSecondaryRotaData(responseSecondary.data);
        } else {
          setSecondaryRotaData([])
        };

      } catch (error) {

        if (error.response.status === 404){
          setRotaData(null);
        } else {
        catchResponseError(error);
        }

      }
    };
  
    fetchRotaData();
    setShowStatDropdown(false);
  }, [branch, date]);

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

          <div className='flex justify-between items-center space-x-2 mb-3'>
            <div className="p-2! flex-1 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input dark:border-border dark:hover:bg-input/50">
              <Input
                type="date"
                value={date}
                min="2024-12-23"
                max={format(addDays(new Date(), 365), 'yyyy-MM-dd')}
                onChange={(e) => {
                  setDate(e.target.value);
                  sessionStorage.setItem('date', e.target.value);
                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                }}
              />
            </div>
              

            <Button
              variant="outline"
              size="icon-xl"
              className="rounded-lg"
              onClick={() => {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                navigate('./calendar', { state: {
                  branch: branch,
                  rotaAdmin: rotaAdmin.includes(branch),
                  maxDuties: userBranches[branch].maxDuties,
                  initDataUnsafe: initDataUnsafe
                }});
              }}
            >
              <CalendarDays size={25} className="size-6"/>
            </Button>

            <div className='relative inline-block'>
              <Button
                variant="outline"
                size="icon-xl"
                className='rounded-lg'
                onClick={() => {
                  window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                  if (rotaAdmin.includes(branch)) {
                    setShowStatDropdown(prev => !prev);
                  }
                  else {
                    setShowPersonalStats(true);
                  };
                }}
              >
                <ChartNoAxesCombined size={25} className='size-6'/>
              </Button>

              {showStatDropdown && (
                <div className='dropdown-container'>
                  <button
                    className='dropdown-button'
                    onClick={() => {
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                      setShowPersonalStats(true);
                    }}
                  >
                    Личная
                  </button>

                  <Separator/>

                  <button
                    className='dropdown-button'
                    onClick={() => {
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                      navigate('./stats/overview', { state: {
                        branch: branch,
                        initDataUnsafe: initDataUnsafe
                      }});
                    }}
                  >
                    Сводная
                  </button>
                </div>
              )}
            </div>
                
            {rotaAdmin.includes(branch) && (
              <Button
                variant="outline"
                size="icon-xl"
                className="rounded-lg"
                onClick={() => {
                  setShowUserManagement(true);
                  window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }}
              >
                <Settings size={25} className="size-6"/>
              </Button>
            )}
          </div>
        </>
      )}

      <MyDutiesCard 
        branch={branch}
        userId={initDataUnsafe?.user?.id ?? null}
      />

      {userBranches !== null
      ? rotaData !== null
        ? <AnimatePresence custom={swipeDirection}>
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
              {rotaData.map((dutyHour, index) => (
                <RotaHour
                  key={index}
                  branch={branch}
                  date={date}
                  dutyHour={dutyHour}
                  secondaryDutyHour={secondaryRotaData[index]}
                  rotaAdmin={rotaAdmin.includes(branch)}
                  maxDuties={userBranches[branch].maxDuties}
                  initDataUnsafe={initDataUnsafe}
                  setRotaData={setRotaData}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        :
          (
            <Suspense fallback={null}>
              <div className='size-7/12  mx-auto'>
                <Animation animationData={shrugAnimationData} />
                <p className='text-center dark:text-white'>График за этот день недоступен :(</p>
              </div>
            </Suspense>
          )
      :
      <></>
      }

      {showForbidden && (
        <Suspense fallback={null}>
          <div className='popup flex justify-center items-center'>
            <div className='w-[50%]'>
              <Animation animationData={deniedAnimationData} />
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

      <ToastContainer
        position='bottom-center'
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        theme={window.Telegram.WebApp.colorScheme}
        limit={4}
      />

  </div>
  );
}

export default Main;
