import { useState, useEffect, Suspense, lazy } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, NotepadText, ChartColumn, User, Wrench } from "lucide-react";

// Sections
import UserEditForm from "./rota/userEditForm";
const PersonalStats = lazy(() => import('./statistics/personalStats'));
const MyDutiesCard = lazy(() => import('./rota/myDuties'));
const ModifyRotaMulti = lazy(() => import('./rota/modifyRotaMulti'));

// Styles
import '../styles/App.css';

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


export default function UserProfile(){
  const location = useLocation();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('settings');

  // Checking if all the neccessary location states exist, otherwise redirect
  const { branch, editingUser, initDataUnsafe } = location.state || {};
  const requiredParams = [branch, editingUser, initDataUnsafe];
  useEffect(() => {
    if (requiredParams.some(param => param === undefined)){
      navigate('/Inforgiy_Web/', { replace: true })
    }
  }, [navigate, requiredParams])

  if (requiredParams.some(param => param === undefined)){
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
          icon={User}
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
            icon={NotepadText}
            isOpen={openSection === "duties"}
            onClick={() => handleToggle("duties")}
          >
            <Suspense fallback={null}>
              <MyDutiesCard
                branch={branch}
                userId={editingUser.id}
                prevDays={14}
                nextDays={30}
              />
            </Suspense>
          </CollapsibleSection>


          <CollapsibleSection
            title={'Групповые операции'}
            icon={Wrench}
            isOpen={openSection === "modify_rota_multi"}
            onClick={() => handleToggle("modify_rota_multi")}
          >
            <Suspense fallback={null}>
              <ModifyRotaMulti
                branch={branch}
                userId={editingUser.id}
                initDataUnsafe={initDataUnsafe}
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
                userId={editingUser.id}
              />
            </Suspense>
          </CollapsibleSection>
        </>
      )}
    </div>
  </div>
  )
}