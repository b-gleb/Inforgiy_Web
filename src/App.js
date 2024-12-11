import React, { useEffect, useState } from 'react';
import Lottie from "react-lottie";
import shrugAnimationData from "./animations/shrug.json";
import axios from 'axios';
import { User, Plus, Settings, Columns3, Trash2 } from 'lucide-react';
import './App.css';
import './tailwind.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function catchResponseError(error){
  console.error(error.code, error.status,  error.response.data);
  toast.error(`ERROR ${error.status}: ${error.response.data}`);
  window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
}


  const [showSearch, setShowSearch] = useState(false);
  let hourContainerClass = "hour-container";
  let today = new Date().toISOString().split("T")[0];

  if (Object.keys(usersDict).length === 0 && usersDict.constructor === Object) {
    hourContainerClass = "hour-container empty"
  }


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
            <div key={index} className={`username-box ${boxClass}`}>
              <span>{userObj.username}</span>

              {rotaAdmin && (
                <button
                  className="ml-2"
                  onClick={() => handleUpdateRota('remove', branch, date, timeRange, user_id, webAppData)}
                >
                  ✕
                </button>
              )}
            </div>
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

        {date >= today && !Object.keys(usersDict).includes(webAppData.initDataUnsafe.user.id) && (
          <button
            className='p-1'
            onClick={() => handleUpdateRota('add', branch, date, timeRange, webAppData.initDataUnsafe.user.id, webAppData)}
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
        webAppData={webAppData}
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
  webAppData,

  date,
  timeRange,
  
  onClose,
  // handleUpdateRota,
  handleUpdateRota,
  onAddNewUser
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
        const response = await axios.get("/api/users", {
          params: { 
            branch: branch,
            user_id: webAppData.initDataUnsafe.user.id,
            // initData: webAppData.initData
          },
        });
        setAllUsers(Object.entries(response.data));
        setFilteredUsers(Object.entries(response.data));
      } catch (error) {
        catchResponseError(error);
      }
    };

    fetchUsers();
  }, [branch, webAppData.initDataUnsafe.user.id]); 


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
                <button
                  key={user_id}
                  onClick={() => {
                    if (mode === 'rota'){
                      handleUpdateRota('add', branch, date, timeRange, user_id, webAppData);
                      onClose();
                    } else if (mode === 'user_management'){
                      setEditingUser({id: user_id, username: Object.keys(userObj)[0], level: String(Object.values(userObj)[0])});
                    }
                  }}
                  className="search_results_button"
                >
                  {Object.keys(userObj)[0]}
                </button>
              ))}
          </div>
        </>
      
        :
        <>
          <UserEditForm
            branch={branch}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            webAppData={webAppData}
          />
        </>
        
      }
    </div>
  )
}


function UserEditForm({ branch, editingUser, setEditingUser, webAppData }){
  const userLevels = {"null": 'Обычный', "0": "Новичок", "1": "Эксперт"};

  const handleChange = (e) => {
    const {name, value} = e.target;

    setEditingUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleRemoveUser = async (branch, user_id, webAppData) => {
    try {
      const response = await axios.post("api/removeUser", {
        branch: branch,
        modifyUserId: user_id,
        user_id: webAppData.initDataUnsafe.user.id,
        initData: webAppData.initData
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
      user_id: webAppData.initDataUnsafe.user.id,
      initData: webAppData.initData
    };

    console.log(data)
    

    try {
      const response = await axios.post('/api/updateUser', data);
      if (response.status === 200){setEditingUser(null)}
    } catch (error) {
      //TODO: Handle error 404 separately
      catchResponseError(error);
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
              handleRemoveUser(branch, editingUser.id, webAppData);
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
  const [webAppData, setWebAppData] = useState(null);
  const [rotaData, setRotaData] = useState({});
  const [rotaAdmin, setRotaAdmin] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [userBranches, setUserBranches] = useState({});
  const [branch, setBranch] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const departments = {'lns': 'ЛНС', 'gp': 'ГП', 'di': 'ДИ'};

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?56";
    script.async = true;

    script.onload = () => {
      console.log("Telegram WebApp script loaded.");
      
      // Add dummy data if Telegram is not available
      if (!window.Telegram.WebApp.initData) {
        console.log("Using mock Telegram WebApp data for testing.");
        window.Telegram = {
          WebApp: {
            initData: "auth_date=<auth_date>\nquery_id=<query_id>\nuser=<user>",
            initDataUnsafe: {
              query_id: "AAEPArgZAAAAAA8CuBmz-HCb",
              user: {
                id: 431489551,
                first_name: "Test",
                last_name: "User",
                username: "b_gleb",
              },
              start_param: null,
              auth_date: "1732642375",
              signature:
                "Ktaufo799peWDD1AQdhCivW3zbLTvT9IWd0EQ-zZVN7jG7Yz59RV69WHIYR3NztYQI5Ybw_WCdmUX-XYsdvyBA",
              hash: "f81325eeb51805bb6a89fe3ff87ec7d32f71a743c9bf44a64021dae382e9ee95",
            },
            version: "8.0",
            platform: "ios",
            colorScheme: "light",
            isActive: true,
          },
        };
      }

      // Update the state with Telegram WebApp data
      setWebAppData(window.Telegram.WebApp);
    };

    script.onerror = () => {
      console.error("Failed to load the Telegram WebApp script.");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if needed
      document.head.removeChild(script);
    };
  }, []);


  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await axios.get("/api/auth", {
          params: {
            initData: webAppData.initData,
            user_id: webAppData.initDataUnsafe.user.id
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

    fetchAuthData();
  }, [webAppData]);

  
  useEffect(() => {
    const fetchRotaData = async () => {
      // Prevent fetching data on mount when branch is not defined
      if (branch === null) {
        return
      }

      try {
        const response = await axios.get("/api/rota", {
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
  


  const handleUpdateRota = async (type, branch, date, timeRange, modifyUserId, webAppData) => {
    try {
      // Send the POST request using async/await
      const response = await axios.post("api/updateRota", {
        type: type,
        branch: branch,
        date: date,
        timeRange: timeRange,
        user_id: modifyUserId,
        initData: webAppData.initData
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
              webAppData={webAppData}
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
            webAppData={webAppData}
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
