import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, CalendarDays, ChartNoAxesCombined } from 'lucide-react';
import { ToastContainer } from 'react-toastify';

// Custom components
import RotaHour from './components/rota/rota';
import MyDutiesCard from './components/rota/myDuties';
import Loading from './components/loading';
import catchResponseError from './utils/responseError.jsx';

// CSS
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';

// Animations
import shrugAnimationData from "./assets/shrug.json";
import deniedAnimationData from "./assets/denied.json";

// Lazy Loading
const UserSearchPopUp = lazy(() => import('./components/rota/userSearchPopUp'));
const WeeklyView = lazy(() => import('./components/WeeklyView'));
const Stats = lazy(() => import('./components/statistics/Stats'));
const Animation = lazy(() => import('./components/animation'));

const departments = {'lns': 'ЛНС', 'gp': 'ГП', 'di': 'ДИ', 'orel': 'Орёл', 'ryaz': 'Рязань'};
const apiUrl = import.meta.env.VITE_PROXY_URL;


function App() {
  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [theme, setTheme] = useState('light');
  const [rotaData, setRotaData] = useState([]);
  const [secondaryRotaData, setSecondaryRotaData] = useState([]);
  const [rotaAdmin, setRotaAdmin] = useState([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [userBranches, setUserBranches] = useState(null);
  const [branch, setBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showForbidden, setShowForbidden] = useState(false);
  const [showRota, setShowRota] = useState(true);
  const isFirstMount = useRef(true);
  const [swipeDirection, setSwipeDirection] = useState(null);


  useEffect(() => {
    if (showUserManagement || showWeekly || showForbidden || showStats) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showUserManagement, showWeekly, showForbidden, showStats]);


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
      setTheme('light');
      setInitDataUnsafe(JSON.parse(import.meta.env.VITE_INIT_DATA_UNSAFE));
    } else {
      console.log('Using real Telegram data');
      setTheme(window.Telegram.WebApp.colorScheme);
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
        const response = await axios.get(`${apiUrl}/api/auth`, {
          params: {
            initDataUnsafe: initDataUnsafe,
          }
        });

        setRotaAdmin(response.data.rotaAdmin)
        setUserBranches(response.data.branches)
        setBranch(Object.keys(response.data.branches)[0])

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
        const response = await axios.get(`${apiUrl}/api/rota`, {
          params: {
            branch: branch,
            date: date,
          },
        });
        setRotaData(response.data);

        if (branch === 'di') {
          const responseSecondary = await axios.get(`${apiUrl}/api/rota`, {
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
  }, [branch, date]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setDate(format(addDays(new Date(date), 1), 'yyyy-MM-dd'));
      setSwipeDirection('left');
      setShowRota(false);
      setTimeout(() => {
        setShowRota(true);
      }, 400);
      isFirstMount.current = false;
    },

    onSwipedRight: () => {
      setDate(format(addDays(new Date(date), -1), 'yyyy-MM-dd'));
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
    <div className={`app ${theme}`}>
      <h1 className='text-3xl font-bold mb-2 dark:text-slate-100'>График</h1>

      {isLoading && <Loading />}

      {!isLoading && userBranches && (
        <>
          {Object.keys(userBranches).length >= 2 && (
            <div className="branches-container">
              <div className="branches-flexbox">
                {Object.entries(userBranches).map(([dept_key, dept_value]) => (
                  <button
                    key={dept_key}
                    onClick={() => {
                      setBranch(dept_key);
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                    }}
                    className={`branch-button ${branch === dept_key ? 'selected' : ''}`}
                    style={{WebkitTapHighlightColor: 'transparent'}}
                  >
                    {departments[dept_key]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='flex justify-between items-center space-x-2 mb-3'>
            <div className="button-icon p-2! flex-1">
              <input
                type="date"
                value={date}
                min={userBranches[branch].minDate}
                max={userBranches[branch].maxDate}
                onChange={(e) => {setDate(e.target.value); window.Telegram.WebApp.HapticFeedback.selectionChanged();}}
                className='input-field '
              />
            </div>
              

            <button
              className='button-icon'
              onClick={() => {
                setShowWeekly(true);
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
              }}
            >
              <CalendarDays size={25} className="icon-text"/>
            </button>


            {rotaAdmin.includes(branch) && (
              <>
                <button
                  className='button-icon'
                  onClick={() => {
                    setShowStats(true);
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                  }}
                >
                  <ChartNoAxesCombined size={25} className='icon-text'/>
                </button>

                <button
                  className='button-icon'
                  onClick={() => {
                    setShowUserManagement(true);
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                  }}
                >
                  <Settings size={25} className="icon-text"/>
                </button>
              </>
            )}
          </div>
        </>
      )}

      <MyDutiesCard 
        branch={branch}
        user_id={initDataUnsafe?.user?.id ?? null}
      />

      {rotaData !== null
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
      : (
        <Suspense fallback={null}>
          <div className='size-7/12  mx-auto'>
            <Animation animationData={shrugAnimationData} />
            <p className='text-center dark:text-white'>График за этот день недоступен :(</p>
          </div>
        </Suspense>
      )
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

      {showWeekly && (
        <Suspense fallback={null}>
          <WeeklyView
            branch={branch}
            rotaAdmin={rotaAdmin.includes(branch)}
            maxDuties={userBranches[branch].maxDuties}
            initDataUnsafe={initDataUnsafe}
            setShowWeekly={setShowWeekly}
          />
        </Suspense>
      )}

      {showStats && (
        <Suspense fallback={null}>
          <Stats
            branch={branch}
            initDataUnsafe={initDataUnsafe}
            setShowStats={setShowStats}  
          />
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

export default App;
