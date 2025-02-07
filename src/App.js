import React, { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Settings, CalendarDays, Trash2, ChartSpline } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

// Custom components
import MyDutiesCard from './MyDuties';
import WeeklyView from './WeeklyView';
import Stats from './statistics/Stats';
import Loading from './components/loading';
import Animation from './components/animation';
import catchResponseError from './utils/responseError';

// APIs
import handleUpdateRota from './services/handleUpdateRota';
import fetchAllUsers from './services/fetchAllUsers';

// CSS
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';

// Animations
import shrugAnimationData from "./assets/shrug.json";
import deniedAnimationData from "./assets/denied.json";

const departments = {'lns': 'ЛНС', 'gp': 'ГП', 'di': 'ДИ'};
const apiUrl = process.env.REACT_APP_PROXY_URL;
let today = format(new Date(), 'yyyy-MM-dd');

function RotaHour({ branch, date, timeRange, usersArray, rotaAdmin, maxDuties, initDataUnsafe, setRotaData}) {
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
      <UserSearchPopUp
        mode='rota'
        branch={branch}
        date={date}
        timeRange={timeRange}
        initDataUnsafe={initDataUnsafe}
        setRotaData={setRotaData}
        onClose={() => setShowSearch(false)}
      />
    )}

    </div>
  );
}


function UserSearchPopUp({ 
  mode,
  branch,
  initDataUnsafe,
  date,
  timeRange,
  onClose,
  setRotaData,
}) {
  // States for fetching users and managing fuzzy search
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // States for user management
  const [editingUser, setEditingUser] = useState(null);

  // Telegram UI Back Button
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(onClose);
    window.Telegram.WebApp.BackButton.show();

    // Cleanup the event listener when the component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
    };
  
  }, [onClose]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await fetchAllUsers(branch, initDataUnsafe);
      setAllUsers(allUsers);
      setFilteredUsers(allUsers);
    };

    fetchUsers();
  }, [branch, initDataUnsafe]);


  // Fuzzy search
  useEffect(() => {
    const results = allUsers.filter((userObj) =>
      userObj.nick.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchQuery, allUsers]);
  

  return (
    <div className="popup">
      {! editingUser
        ? <>
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field mr-2"
            />
            <button 
              onClick={() => onClose()}
              className="p-2 text-[#007aff] text-xl"
            >
              ✕
            </button>
          </div>

          {mode === 'user_management' && (
            <button
              className='button-primary'
              onClick={() => {
                setEditingUser({id: null, username: "@", color: 0});
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
              }}
            >
              + Добавить пользователя
            </button>
          )}

          <div className="search_results_container">
              {filteredUsers.map((userObj) => (
                <motion.button
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { ease: 'easeOut', duration: 0.2}}}
                  key={userObj.id}
                  onClick={() => {
                    if (mode === 'rota'){
                      handleUpdateRota('add', branch, date, timeRange, userObj.id, initDataUnsafe)
                        .then((result) => {setRotaData(result)})
                        .catch(() => {});
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                      onClose();
                    } else if (mode === 'user_management'){
                      setEditingUser(userObj);
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                  }}
                  className="search_results_button"
                >
                  {userObj.nick}
                </motion.button>
              ))}
          </div>
        </>
      
        :
        <>
          <UserEditForm
            branch={branch}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            initDataUnsafe={initDataUnsafe}
          />
        </>
        
      }
    </div>
  )
}


function UserEditForm({ branch, editingUser, setEditingUser, initDataUnsafe }){
  const userColors = {0: "Синий", 1: "Зелёный", 2: "Красный", 3: "Чёрный", 4: "Фиолетовый", 5: "Оранжевый", 6: "Жёлтый"};

  const handleChange = (e) => {
    const {name, value} = e.target;

    if (name === 'color'){
      window.Telegram.WebApp.HapticFeedback.selectionChanged()
    }

    setEditingUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleRemoveUser = async (branch, user_id, initDataUnsafe) => {
    try {
      const response = await axios.post(`${apiUrl}/api/removeUser`, {
        branch: branch,
        modifyUserId: user_id,
        initDataUnsafe: initDataUnsafe
      })

      if (response.status === 200){
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        toast.success('Пользователь удален');
      };

    } catch (error) {
      catchResponseError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      branch: branch,
      userObj: editingUser,
      initDataUnsafe: initDataUnsafe
    };

    try {
      const response = await axios.post(`${apiUrl}/api/updateUser`, data);

      if (response.status === 200){
        setEditingUser(null);
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        toast.success('Пользователь обновлен!')
      };
    } catch (error) {
      // Handle error 404 separately
      if (error.response && error.response.status === 404){
        toast.warn('Пользователь не найден!');
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        catchResponseError(error)
      };
    }
  }

  return(
    <>
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label htmlFor="username" className="form-label">Telegram</label>
        <input
          type="text"
          id="username"
          name="username"
          value={editingUser.username}
          onChange={handleChange}
          required
          readOnly={editingUser.id !== null}
          autoComplete='off'
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="nick" className="form-label">Ник</label>
        <input
          type="text"
          id="nick"
          name="nick"
          value={editingUser.nick}
          onChange={handleChange}
          required
          autoComplete='off'
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="color" className="form-label">Цвет</label>
        <select
          id="color"
          name="color"
          value={editingUser.color}
          onChange={handleChange}
          className="input-field"
        >
          {Object.entries(userColors).map(([color_value, color_display]) => (
            <option key={color_value} value={color_value}>{color_display}</option>
          ))}
        </select>
      </div>

      
      <div className='flex space-x-2'>
      {editingUser.id !== null && (
          <button
            type="button"
            className="button-secondary w-auto"
            onClick={() => {
              handleRemoveUser(branch, editingUser.id, initDataUnsafe);
              setEditingUser(null);
            }}
          >
            <Trash2 color='red' size={25}/>
          </button>
        )}
        <button type="button" onClick={() => {setEditingUser(null); window.Telegram.WebApp.HapticFeedback.impactOccurred('light');}} className="button-secondary w-full">Отменить</button>
        <button type="submit" className="button-primary">Сохранить</button>
      </div>
    </form>

    </>
  )
}



function App() {
  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [theme, setTheme] = useState('light');
  const [rotaData, setRotaData] = useState({});
  const [rotaAdmin, setRotaAdmin] = useState([]);
  const [date, setDate] = useState(today);
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
      console.log(process.env.REACT_APP_INIT_DATA_UNSAFE);
      setTheme('light');
      setInitDataUnsafe(JSON.parse(process.env.REACT_APP_INIT_DATA_UNSAFE));
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
        setRotaData({ ...response.data });
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


  const addDate = (dateString, delta) => {
    let date = new Date(dateString);
    date.setDate(date.getDate() + delta);
    return format(date, 'yyyy-MM-dd');
  }


  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setDate(addDate(date, 1));
      setSwipeDirection('left');
      setShowRota(false);
      setTimeout(() => {
        setShowRota(true);
      }, 400);
      isFirstMount.current = false;
    },

    onSwipedRight: () => {
      setDate(addDate(date, -1));
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
            <div className="button-icon !p-2 flex-1">
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
                  <ChartSpline size={25} className='icon-text'/>
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
        initDataUnsafe={initDataUnsafe}
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
              {Object.entries(rotaData).map(([timeRange, usersArray], index) => (
                <RotaHour
                  key={index}
                  branch={branch}
                  date={date}
                  timeRange={timeRange}
                  usersArray={usersArray}
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
        <div className='size-7/12  mx-auto'>
          <Animation animationData={shrugAnimationData} />
          <p className='text-center dark:text-white'>График за этот день недоступен :(</p>
        </div>
      )
      }

      {showForbidden && (
        <div className='popup flex justify-center items-center'>
          <div className='w-[50%]'>
            <Animation animationData={deniedAnimationData} />
            <p className='text-center dark:text-white'>Недостаточно прав!</p>
          </div>
        </div>
      )}

      {showUserManagement && (
        <UserSearchPopUp
          mode='user_management'
          branch={branch}
          initDataUnsafe={initDataUnsafe}
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {showWeekly && <WeeklyView
        branch={branch}
        initDataUnsafe={initDataUnsafe}
        setShowWeekly={setShowWeekly}
      />}

      {showStats && <Stats
        branch={branch}
        initDataUnsafe={initDataUnsafe}
        setShowStats={setShowStats}  
      />}

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
