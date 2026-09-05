import { User as UserType } from '@/types/user';
import { AnimatePresence } from 'framer-motion';
import UserBox from '@/pages/rota/components/UserBox/UserBox';
import { User, Plus } from 'lucide-react';

export interface RotaSlotProps {
  /** Department slug, used to add users to rota and determine the background of an empty slot */
  department: string;
  /** Label for the time slot */
  label: string;
  /** Array of user objects for the time slot */
  users: UserType[];
  /** Array of user objects for the time slot in another department. 
   * Allows to display limited information about duties from another department.
   */
  secondaryUsers?: UserType[] | null;
  /** Based on date and user's permissions. Determines if an add button will be shown */
  canAddSelf?: boolean;
  /** Based on user's permissions. Determines if an add others button will be shown */
  canAddOthers?: boolean;
  /** Based on user's permissions. Determines if a remove button will be shown in the `UserBox` */
  canRemove?: boolean;
  /** Function to be called when pressing the cross icon. Passed to the `UserBox` */
  onRemove: (userId: number, timeRange: string) => void;
  /** Function to be called when pressing the plus icon */
  onAddSelf: (timeRange: string) => void;
  /** Function to be called when pressing the user icon */
  onOpenUserSearch: () => void;
}

/** Component representing a single time slot in the rota */
export default function RotaSlot({
  department,
  label,
  users,
  secondaryUsers = null,
  canAddSelf = false,
  canAddOthers = false,
  canRemove = false,
  onRemove,
  onAddSelf,
  onOpenUserSearch,
}: RotaSlotProps) {
  const containerClass = users.length === 0 ? `hour-container empty ${department}` : 'hour-container';

  return (
    <div className={containerClass}>
      <div className="flex flex-col">
        <span className="hour-label">{label}</span>

        {secondaryUsers && secondaryUsers.length > 0 && (
          <div className="flex gap-1">
            {secondaryUsers.map((user) => (
              <div key={user.id} className={`user-box color-${user.color}`} />
            ))}
          </div>
        )}
      </div>

      <div className="usernames-container">
        <AnimatePresence>
          {users.map((user) => (
            <UserBox
              key={user.id}
              userObj={user}
              canRemove={canRemove}
              onRemove={() => onRemove(user.id, label)}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="buttons-container">
        {canAddOthers && onOpenUserSearch && (
          <button className="p-1" onClick={onOpenUserSearch} aria-label="Assign user">
            <User size={15} className="icon-text" />
          </button>
        )}

        {canAddSelf && (
          <button className="p-1" onClick={() => onAddSelf(label)} aria-label="Add yourself">
            <Plus size={15} className="icon-text" />
          </button>
        )}
      </div>
    </div>
  );
};