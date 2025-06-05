import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// APIs
import fetchAllUsers from '../../services/fetchAllUsers';
import updateRota from '../../services/updateRota';

// Lazy Loading
const UserProfile = lazy(() => import('../userProfile'));
const UserEditForm = lazy(() => import('./userEditForm'));

export default function UserSearchPopUp({ 
  mode,
  branch,
  initDataUnsafe,
  date,
  timeRange,
  onClose,
  setRotaData,
  handleUpdateCell
}) {
  // States for fetching users and managing fuzzy search
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // User management
  const [editingUser, setEditingUser] = useState(null);

  // Telegram UI Back Button
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(onClose);
    window.Telegram.WebApp.BackButton.show();

    return () => {
      window.Telegram.WebApp.BackButton.offClick(onClose);
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
      {! editingUser ? (
        <>
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
                      updateRota({
                          type: 'add',
                          branch: branch,
                          date: date,
                          timeRange: timeRange,
                          modifyUserId: userObj.id,
                          initDataUnsafe: initDataUnsafe
                        })
                        .then((result) => {setRotaData(result)})
                        .catch(() => {});
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                      onClose();
                    } else if (mode === 'user_management'){
                      window.Telegram.WebApp.BackButton.offClick(onClose);
                      setEditingUser(userObj);
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    } else if (mode === 'rota_weekly'){
                      handleUpdateCell({
                        type: 'add',
                        branch: branch,
                        modifyUserId: userObj.id,
                        initDataUnsafe: initDataUnsafe
                      })
                      .then(() => {
                        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                        onClose();
                      })
                      .catch(() => {});
                    }
                  }}
                  className="search_results_button"
                >
                  {userObj.nick}
                </motion.button>
              ))}
          </div>
        </>
      )
      : (

        editingUser?.id !== null ? (
          // Show full user profile
          <Suspense fallback={null}>
            <UserProfile
              branch={branch}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
              initDataUnsafe={initDataUnsafe}
            />
          </Suspense>
        )
        : (
          // Adding a new user
          <Suspense fallback={null}>
            <UserEditForm
              branch={branch}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
              initDataUnsafe={initDataUnsafe}
            />
          </Suspense>
        )
      )}
    </div>
  )
};