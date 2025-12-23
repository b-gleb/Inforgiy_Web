import { useEffect, Suspense, lazy } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { NotepadText, ChartColumn, User, Wrench } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Sections
import UserEditForm from "@/components/rota/userEditForm";
const PersonalStats = lazy(() => import('@/components/statistics/personalStats'));
const MyDutiesCard = lazy(() => import('@/components/rota/myDuties'));
const ModifyRotaMulti = lazy(() => import('@/components/rota/modifyRotaMulti'));

// Styles
import '@/styles/App.css';

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();

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

  const accordionClass = "text-lg font-semibold";
  const accordionTitleClass = "flex items-center gap-2"

  return (
    <div className={`app ${sessionStorage.getItem('theme') || 'light'}`}>
      <div className="popup">
        <Accordion
          type="single"
          defaultValue="settings"
          collapsible
        >
          <AccordionItem value="settings">
            <AccordionTrigger
              className={accordionClass}>
                <div className={accordionTitleClass}>
                  <User/> Профиль
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <UserEditForm
                branch={branch}
                User={editingUser}
                initDataUnsafe={initDataUnsafe}
              />
            </AccordionContent>
          </AccordionItem>

          {editingUser.id !== null && (
          <>
            <AccordionItem value="duties">
              <AccordionTrigger
                className={accordionClass}>
                  <div className={accordionTitleClass}>
                    <NotepadText/> Смены
                  </div>
              </AccordionTrigger>
              <AccordionContent>
                <Suspense fallback={null}>
                  <MyDutiesCard
                    branch={branch}
                    userId={editingUser.id}
                    prevDays={14}
                    nextDays={30}
                  />
                </Suspense>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="modify_rota_multi">
              <AccordionTrigger
                className={accordionClass}>
                  <div className={accordionTitleClass}>
                    <Wrench/> Групповые операции
                  </div>
              </AccordionTrigger>
              <AccordionContent>
                <Suspense fallback={null}>
                  <ModifyRotaMulti
                    branch={branch}
                    userId={editingUser.id}
                    initDataUnsafe={initDataUnsafe}
                  />
                </Suspense>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="personal_stats">
              <AccordionTrigger
                className={accordionClass}>
                  <div className={accordionTitleClass}>
                    <ChartColumn/> Статистика
                  </div>
              </AccordionTrigger>
              <AccordionContent>
                <Suspense fallback={null}>
                  <PersonalStats
                    branch={branch}
                    userId={editingUser.id}
                  />
                </Suspense>
              </AccordionContent>
            </AccordionItem>
          </>
          )}
        </Accordion>
      </div>
    </div>
  )
}