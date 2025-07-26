import { useState, useEffect, Suspense, lazy } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

// Sections
import UserEditForm from "./rota/userEditForm";
const PersonalStats = lazy(() => import('./statistics/personalStats'));
const MyDutiesCard = lazy(() => import('./rota/myDuties'));

// Styles
import '../styles/App.css';

const CollapsibleSection = ({ title, isOpen, onClick, children }) => {
  return (
    <>
      {/* Header */}
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center px-1 py-3 border-b dark:border-gray-400"
      >
        <span className="text-lg font-semibold dark:text-gray-400">
          {title}
        </span>
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


export default function UserProfile(){
  const location = useLocation();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('settings');

  // Checking if all the neccessary location states exist, otherwise redirect
  const { branch, editingUser, initDataUnsafe } = location.state || {};
  useEffect(() => {
    if (!branch || !editingUser || !initDataUnsafe){
      navigate('/Inforgiy_Web/', { replace: true })
    }
  }, [navigate, branch, editingUser, initDataUnsafe])

  if (!branch || !editingUser || !initDataUnsafe){
    return null;
  };

  // Telegram UI Back Button
  useEffect(() => {
    const handleBackClick = () => {
      navigate('/Inforgiy_Web/', { state: { showUserManagement: true } });
    };

    window.Telegram.WebApp.BackButton.onClick(handleBackClick);
    window.Telegram.WebApp.BackButton.show();

    return () => {
      window.Telegram.WebApp.BackButton.offClick(handleBackClick);
      window.Telegram.WebApp.BackButton.hide();
    }
  }, [editingUser])

  // Opening and closing the sections
  const handleToggle = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className={`app ${sessionStorage.getItem('theme') || 'light'}`}>
      <div className="popup">
        <CollapsibleSection
          title={'Профиль'}
          isOpen={openSection === "settings"}
          onClick={() => handleToggle("settings")}
        >
          <UserEditForm
            branch={branch}
            User={editingUser}
            initDataUnsafe={initDataUnsafe}
          />
        </CollapsibleSection>

      {editingUser.id !== null && (
        <>
          <CollapsibleSection
            title={'Смены'}
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
      )}
    </div>
  </div>
  )
}