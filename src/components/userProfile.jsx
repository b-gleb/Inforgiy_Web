import { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, NotepadText, ChartColumn, User } from "lucide-react";

// Sections
import UserEditForm from "./rota/userEditForm";
const PersonalStats = lazy(() => import('./statistics/personalStats'));
const MyDutiesCard = lazy(() => import('./rota/myDuties'));


const CollapsibleSection = ({ title, icon: Icon, isOpen, onClick, children }) => {
  return (
    <>
      {/* Header */}
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center px-1 py-3 border-b dark:border-gray-400"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="icon-text" />}
          <span className="text-lg font-semibold dark:text-gray-400">
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="icon-text"/>
        ) : (
          <ChevronDown className="icon-text"/>
        )}
      </button>

      {/* Content */}
      <AnimatePresence key={title}>
        {isOpen && (
          <motion.div
            initial={false}
            animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


export default function UserProfile({ branch, editingUser, setEditingUser, initDataUnsafe }){
  const [openSection, setOpenSection] = useState('settings');

  const handleToggle = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // Telegram UI Back Button
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(() => setEditingUser(null));

    return () => {
      window.Telegram.WebApp.BackButton.offClick(() => setEditingUser(null));
    }
  }, [editingUser])

  return (
    <>

      <CollapsibleSection
        title={'Профиль'}
        icon={User}
        isOpen={openSection === "settings"}
        onClick={() => handleToggle("settings")}
      >
        <UserEditForm
          branch={branch}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          initDataUnsafe={initDataUnsafe}
        />
      </CollapsibleSection>


      <CollapsibleSection
        title={'Смены'}
        icon={NotepadText}
        isOpen={openSection === "duties"}
        onClick={() => handleToggle("duties")}
      >
        <Suspense fallback={null}>
          <MyDutiesCard
            branch={branch}
            user_id={editingUser.id}
            prevDays={14}
            nextDays={30}
          />
        </Suspense>
      </CollapsibleSection>


      <CollapsibleSection
        title={'Статистика'}
        icon={ChartColumn}
        isOpen={openSection === "personal_stats"}
        onClick={() => handleToggle("personal_stats")}
      >
        <Suspense fallback={null}>
          <PersonalStats
            branch={branch}
            user_id={editingUser.id}
          />
        </Suspense>
      </CollapsibleSection>

    </>
  )
}