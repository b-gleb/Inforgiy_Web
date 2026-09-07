import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/user';
import { OctagonX } from 'lucide-react';
import { ApiStatus } from '@/types/apiStatus';

interface UserSearchProps {
  /** API Status */
  status: ApiStatus;
  /** User objects for a department */
  users: User[];
  /** Determines if the "Add User" button will be shown */
  showAddUserButton?: boolean
  /** Function to be called when a user is selected */
  onSelectUser: (user: User) => void;
  /** Function to be called when "Add User" button is pressed */
  onAddUser?: () => void;
  /** Function to be called when cross icon is pressed*/
  onClose: () => void;
}

/** Shows all users in the department. Allows filtering by the nickname */
export default function UserSearch({
  status,
  users,
  showAddUserButton = false,
  onSelectUser,
  onAddUser,
  onClose
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;

    return users.filter(user => 
      user.nick.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])


  return (
    <>
      <div className="flex items-center mb-2">
        <Input 
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e:any) => setSearchQuery(e.target.value)}
          className="mr-2"
        />
        <button
          onClick={() => onClose()}
          className="p-2 text-[#007aff] text-xl"
        >
          ✕
        </button>
      </div>

      {showAddUserButton && (
        <Button
          variant="default"
          size="lg"
          className="w-full font-semibold mb-2"
          onClick={onAddUser}
        >
          + Добавить пользователя
        </Button>
      )}

      {status === 'error' && (
        <div className='flex justify-center gap-1 text-red-500' role='alert'>
        <OctagonX/> <span>Ошибка загрузки!</span>
        </div>
      )}

      {status === 'pending' && (
        <div className="search_results_container auto-rows-10.5!">
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-10 rounded-md border border-input bg-muted animate-pulse"
              style={{ animationDelay: `${i * 75}ms` }}
            />
          ))}
        </div>
      )}

      {status === 'success' && (
        <div className="search_results_container">
          {filteredUsers.map((user) => (
            <motion.div
              initial={{ opacity: 0.5, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, transition: { ease: 'easeOut', duration: 0.2 } }}
              key={user.id}
            >
              <Button
                variant="outline"
                size="default"
                className="w-full dark:text-white"
                onClick={() => onSelectUser(user)}
              >
                {user.nick}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </>
  )
}
