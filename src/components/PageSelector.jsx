import { addDays, format } from 'date-fns';
import { CalendarDays, ChartNoAxesCombined, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function PageSelector ({
    date,
    onDateChange,
    branch,
    isRotaAdmin,
    userBranches,
    initDataUnsafe,
    navigate,
    showStatDropdown,
    setShowStatDropdown,
    onShowPersonalStats,
    onShowUserManagement,
}) {
  return (
    <div className='flex justify-between items-center space-x-2 mb-3'>
      <div className="p-2! flex-1 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input dark:border-border dark:hover:bg-input/50">
        <Input
          type="date"
          value={date}
          min="2024-12-23"
          max={format(addDays(new Date(), 365), 'yyyy-MM-dd')}
          onChange={(e) => {
            onDateChange(e.target.value);
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
          }}
        />
      </div>
        

      <Button
        variant="outline"
        size="icon-xl"
        className="rounded-lg"
        onClick={() => {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
          navigate('./calendar', { state: {
            branch: branch,
            rotaAdmin: isRotaAdmin,
            maxDuties: userBranches[branch].maxDuties,
            initDataUnsafe: initDataUnsafe
          }});
        }}
      >
        <CalendarDays size={25} className="size-6"/>
      </Button>

      <div className='relative inline-block'>
        <Button
          variant="outline"
          size="icon-xl"
          className='rounded-lg'
          onClick={() => {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            isRotaAdmin
              ? setShowStatDropdown((prev) => !prev)
              : onShowPersonalStats();
          }}
        >
          <ChartNoAxesCombined size={25} className='size-6'/>
        </Button>

        {showStatDropdown && (
          <div className='dropdown-container'>
            <button
              className='dropdown-button'
              onClick={() => {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                onShowPersonalStats();
              }}
            >
              Личная
            </button>

            <Separator/>

            <button
              className='dropdown-button'
              onClick={() => {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                navigate('./stats/overview', { state: {
                  branch: branch,
                  initDataUnsafe: initDataUnsafe
                }});
              }}
            >
              Сводная
            </button>
          </div>
        )}
      </div>
          
      {isRotaAdmin && (
        <Button
          variant="outline"
          size="icon-xl"
          className="rounded-lg"
          onClick={() => onShowUserManagement()}
        >
          <Settings size={25} className="size-6"/>
        </Button>
      )}
    </div>
  )
};
