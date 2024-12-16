import React, { useEffect, useState } from 'react';
import Lottie from "react-lottie";
import shrugAnimationData from "./animations/shrug.json";
import axios from 'axios';
import { User, Plus, Settings, Columns3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import './tailwind.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = process.env.REACT_APP_PROXY_URL;
let today = new Date().toISOString().split("T")[0];

function catchResponseError(error){
  console.error(error.code, error.status,  error.response.data);
  toast.error(`ERROR ${error.status}: ${error.response.data}`);
  window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
}


function RotaHour({ branch, date, timeRange, usersDict, rotaAdmin, maxDuties, initDataUnsafe, handleUpdateRota}) {
  const [showSearch, setShowSearch] = useState(false);
  let hourContainerClass = "hour-container";

  if (Object.keys(usersDict).length === 0 && usersDict.constructor === Object) {
    hourContainerClass = "hour-container empty"
  };


  return (
    <div className={hourContainerClass}>
      <span className="hour-label">{timeRange}</span>
      <div className="usernames-container">
        {Object.entries(usersDict).map(([user_id, userObj], index) => {
          // Determine the appropriate class based on value
          const boxClass =
            userObj.level === null ? "light-blue" :
            userObj.level === 0 ? "dark-green" : "light-red";

          return (
            <AnimatePresence key={index}>
              <motion.div
                key={index}
                className={`username-box ${boxClass}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
              <span>{userObj.username}</span>

              {rotaAdmin && (
                <button
                  className="ml-2"
                    onClick={() => handleUpdateRota('remove', branch, date, timeRange, user_id, initDataUnsafe)}
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
            onClick={() => setShowSearch(true)}
          >
            <User size={15} className="icon-text" />
          </button>
        )}

        {date >= today && !(initDataUnsafe.user.id in usersDict) && Object.keys(usersDict).length < maxDuties && (
          <button
            className='p-1'
            onClick={() => handleUpdateRota('add', branch, date, timeRange, initDataUnsafe.user.id, initDataUnsafe)}
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
        handleUpdateRota={handleUpdateRota}
        onClose={() => setShowSearch(false)}
      />
    )}

    </div>
  );
}


function ShrugAnimation() {
    const options = {
      loop: true, // Set to false if you don't want the animation to loop
      autoplay: true, // Autoplay the animation
      animationData: shrugAnimationData, // The JSON data of the sticker
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice", // You can adjust this based on your layout
      },
    };
  
    return (
      <div className='size-7/12  mx-auto'>
        <Lottie options={options} />
        <p className='text-center dark:text-white'>День не найден :(</p>
      </div>
    );
  };


function UserSearchPopUp({ 
  mode,
  branch,
  initDataUnsafe,

  date,
  timeRange,
  
  onClose,
  handleUpdateRota,
}) {
  // States for fetching users and managing fuzzy search
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // States for user management
  const [editingUser, setEditingUser] = useState(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users`, {
          params: { 
            branch: branch,
            initDataUnsafe: initDataUnsafe
          },
        });
        setAllUsers(Object.entries(response.data));
        setFilteredUsers(Object.entries(response.data));
      } catch (error) {
        catchResponseError(error);
      }
    };

    fetchUsers();
  }, [branch, initDataUnsafe]); 


  // Fuzzy search
  useEffect(() => {
    const results = allUsers.filter(([user_id, userObj]) =>
      Object.keys(userObj)[0].toLowerCase().includes(searchQuery.toLowerCase())
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
              onClick={() => setEditingUser({id: null, username: "@", level: "null"})}
            >
              + Добавить пользователя
            </button>
          )}

          <div className="search_results_container">
              {filteredUsers.map(([user_id, userObj]) => (
                <motion.button
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { ease: 'easeOut', duration: 0.2}}}

                  key={user_id}
                  onClick={() => {
                    if (mode === 'rota'){
                      handleUpdateRota('add', branch, date, timeRange, user_id, initDataUnsafe);
                      onClose();
                    } else if (mode === 'user_management'){
                      setEditingUser({id: user_id, username: Object.keys(userObj)[0], level: String(Object.values(userObj)[0])});
                    }
                  }}
                  className="search_results_button"
                >
                  {Object.keys(userObj)[0]}
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
  const userLevels = {"null": 'Обычный', "0": "Новичок", "1": "Эксперт"};

  const handleChange = (e) => {
    const {name, value} = e.target;

    setEditingUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleRemoveUser = async (branch, user_id, initDataUnsafe) => {
    try {
      await axios.post(`${apiUrl}/api/removeUser`, {
        branch: branch,
        modifyUserId: user_id,
        initDataUnsafe: initDataUnsafe
      })
    } catch (error) {
      catchResponseError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      branch: branch,
      modifyUserId: editingUser.id,
      modifyUsername: editingUser.username,
      level: editingUser.level === 'null' ? null : editingUser.level, // Server expects level to be of type null not string "null"
      initDataUnsafe: initDataUnsafe
    };

    try {
      const response = await axios.post(`${apiUrl}/api/updateUser`, data);
      if (response.status === 200){setEditingUser(null)}
    } catch (error) {
      // Handle error 404 separately
      if (error.response && error.response.status === 404){
        toast.warn('Пользователь не найден!')
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
        <label htmlFor="level" className="form-label">Уровень</label>
        <select
          id="level"
          name="level"
          value={editingUser.level}
          onChange={handleChange}
          className="input-field"
        >
          {Object.entries(userLevels).map(([level_value, level_display]) => (
            <option key={level_value} value={level_value}>{level_display}</option>
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
        <button type="button" onClick={() => {setEditingUser(null)}} className="button-secondary">Отменить</button>
        <button type="submit" className="button-primary">Сохранить</button>
      </div>
    </form>

    </>
  )
}



function App() {
  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [rotaData, setRotaData] = useState({});
  const [rotaAdmin, setRotaAdmin] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [userBranches, setUserBranches] = useState({});
  const [branch, setBranch] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const departments = {'lns': 'ЛНС', 'gp': 'ГП', 'di': 'ДИ'};

  useEffect(() => {
    if (! window.Telegram.WebApp){
      console.warn('Telegram WebApp is not avaliable')
      return
    } else if (Object.keys(window.Telegram.WebApp.initDataUnsafe).length === 0) {
      console.log('Using mock Telegram data')
      console.log(process.env.REACT_APP_INIT_DATA_UNSAFE)
        setInitDataUnsafe(JSON.parse(process.env.REACT_APP_INIT_DATA_UNSAFE))
    } else {
      console.log('Using real Telegram data');
      setInitDataUnsafe(window.Telegram.WebApp.initDataUnsafe);
      window.Telegram.WebApp.disableVerticalSwipes();
      window.Telegram.WebApp.expand();
    }
  }, []);


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
        catchResponseError(error);
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
  


  const handleUpdateRota = async (type, branch, date, timeRange, modifyUserId, initDataUnsafe) => {
    try {
      // Send the POST request using async/await
      const response = await axios.post(`${apiUrl}/api/updateRota`, {
        type: type,
        branch: branch,
        date: date,
        timeRange: timeRange,
        modifyUserId: modifyUserId,
        initDataUnsafe: initDataUnsafe
      });
  
      setRotaData(response.data);
    } catch (error) {
      catchResponseError(error);
    }
  };
  

  return (
    <div className="app">

        <h1 className='text-3xl font-bold dark:text-slate-100'>График</h1>

        {Object.keys(userBranches).length > 0 && (
          <div className="branches-container">
            <div className="branches-flexbox">
              {Object.entries(userBranches).map(([dept_key, dept_value]) => (
                <button
                  key={dept_key}
                  onClick={() => setBranch(dept_key)}
                  className={`branch-button ${
                    branch === dept_key
                      ? 'selected'
                      : ''
                  }`}
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {departments[dept_key]}
                </button>
              ))}
            </div>
          </div>
        )}


        <div className='flex justify-between items-center space-x-4'>
          <div className="button-icon p-2 flex-1">
            <input
              type="date"
              value={date}
              min={"2024-01-01"}
              max={"2025-12-31"}
              onChange={(e) => setDate(e.target.value)}
              className='input-field '
            />
          </div>

          <button className='button-icon'>
            <Columns3 size={25} className="icon-text"/>
          </button>

          {rotaAdmin.includes(branch) && (
            <button
              className='button-icon'
              onClick={() => setShowUserManagement(true)}
            >
              <Settings size={25} className="icon-text"/>
            </button>
          )}
        </div>

        {rotaData !== null
        ? <div className='hours-grid'>
          {Object.entries(rotaData).map(([timeRange, usersDict], index) => (
            <RotaHour
              key={index}
              branch={branch}
              date={date}
              timeRange={timeRange}
              usersDict={usersDict}
              rotaAdmin={rotaAdmin.includes(branch)}
              maxDuties={userBranches[branch].maxDuties}
              initDataUnsafe={initDataUnsafe}
              handleUpdateRota={handleUpdateRota}
            />
          ))}
        </div>
        : <ShrugAnimation/>
        }

        {showUserManagement && (
          <UserSearchPopUp
            mode='user_management'
            branch={branch}
            initDataUnsafe={initDataUnsafe}
            onClose={() => setShowUserManagement(false)}
          />
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
