import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Custom components
import UserEditForm from './userEditForm';

// APIs
import fetchAllUsers from '../services/fetchAllUsers';
import updateRota from '../services/updateRota';

export default function UserSearchPopUp({ 
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
    const fetchUsers = () => {
      fetchAllUsers(branch, initDataUnsafe)
        .then((result) => {setAllUsers(result); setFilteredUsers(result)})
        .catch(() => {});
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
                      updateRota('add', branch, date, timeRange, userObj.id, initDataUnsafe)
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
};