import { AnimatePresence, motion } from "framer-motion";
import { User } from "@/types/user";

interface UserBoxProps {
  /** Complete user object */
  userObj: User;
  /** Determines if the cross to remove the user will be shown */
  rotaAdmin: boolean;
  /** Function to be called when pressing the cross */
  onRemove?: () => void;
}

/** Box containing user's nickname in the rota*/
export default function UserBox({
  userObj,
  rotaAdmin,
  onRemove,
}: UserBoxProps) {
  return (
    <AnimatePresence>
      <motion.div
        className={`username-box color-${userObj.color}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <span>{userObj.nick}</span>

        {rotaAdmin && (
          <button className="ml-2" onClick={onRemove}>
            ✕
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
