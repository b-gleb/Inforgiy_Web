import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";

// APIs
import { useGetUsers } from '@/hooks/userHooks';
import { useUpdateRota } from '@/hooks/rotaHooks';

export default function UserSearchPopUp({ 
  mode,
  branch,
  initDataUnsafe,
  date,
  timeRange,
  onClose,
  handleUpdateCell
}) {
  const navigate = useNavigate();
  // TODO: Should be invalidated by adding/removing a user
  const {data: allUsers = [], isLoading, isError, error} = useGetUsers({branch, initDataUnsafe});
  const { mutate: updateRota } = useUpdateRota();
  const [searchQuery, setSearchQuery] = useState("");

  // Partial search
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers

    return allUsers.filter(userObj =>
      userObj.nick.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allUsers, searchQuery]);

  // Telegram UI Back Button
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(onClose);
    window.Telegram.WebApp.BackButton.show();

    return () => {
      window.Telegram.WebApp.BackButton.offClick(onClose);
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [onClose]);

  return (
    <div className="popup">
      <div className="flex items-center mb-2">
        <Input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mr-2"
        />
        <button 
          onClick={() => onClose()}
          className="p-2 text-[#007aff] text-xl"
        >
          ✕
        </button>
      </div>

      {mode === 'user_management' && (
        <Button
          size="lg"
          className="w-full font-semibold mb-2"
          onClick={() => {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            navigate('./profile', {
              state: {
                branch,
                editingUser: {id: null, username: "@", color: 0},
                initDataUnsafe
              }
            });
          }}
        >
          + Добавить пользователя
        </Button>
      )}

      <div className="search_results_container">
        {filteredUsers.map((userObj) => (
          <motion.div
            initial={{ opacity: 0.5, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1, transition: { ease: 'easeOut', duration: 0.2}}}
            key={userObj.id}
          >
            <Button
              variant="outline"
              className="w-full dark:text-white"
              onClick={() => {
                if (mode === 'rota'){
                  updateRota(
                    {
                      type: 'add',
                      branch,
                      date,
                      timeRange,
                      userId: userObj.id,
                      initDataUnsafe
                    },
                    {
                      onSuccess: (data, variable, context) => {
                        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                        onClose();
                      }
                    }
                  )
                } else if (mode === 'user_management'){
                  window.Telegram.WebApp.BackButton.offClick(onClose);
                  window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                  navigate('./profile', {
                    state: {
                      branch,
                      editingUser: userObj,
                      initDataUnsafe
                    }});
                } else if (mode === 'rota_weekly'){
                  handleUpdateCell({
                    type: 'add',
                    branch: branch,
                    userId: userObj.id,
                    initDataUnsafe: initDataUnsafe
                  })
                  .then(() => {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    onClose();
                  })
                  .catch(() => {});
                }
              }}
            >
              {userObj.nick}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};