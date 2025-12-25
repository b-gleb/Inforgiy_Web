import { useState} from 'react';
import api from '@/services/api.ts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { eachDayOfInterval } from 'date-fns';
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldContent,
  FieldLabel
} from "@/components/ui/field";


export default function ModifyRotaMulti({ branch, userId, initDataUnsafe }) {
  const [step, setStep] = useState(0);
  const [action, setAction] = useState(null);
  const [dateRange, setDateRange] = useState(undefined);
  const [days, setDays] = useState([]);
  const [hours, setHours] = useState([]);
  const [allowOccupiedSlots, setAllowOccupiedSlots] = useState(true);

  const actionOptions = {
    'add': '+ Добавить',
    'remove': '– Удалить'
  };
  const dayOptions = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const hourOptions = [...Array(24).keys()];

  function countDaysInRange(startDate, endDate, targetDays) {
    const jsDays = targetDays.map(d => (d + 1) % 7);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.filter(d => jsDays.includes(d.getDay())).length;
  };

  const handleChangeAction = (selected) => {
    if (selected !== action) {
      setAction(selected);
      setStep(1);
      setDateRange(undefined);
      setDays([]);
      setHours([]);
      setAllowOccupiedSlots(true);
    }

    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleChangeDateRange = (range) => {
    setDateRange(range);
    if (range === undefined || range.from === range.to) {setStep(1); setDays([]); setHours([]);}
    if (range !== undefined && range.from !== range.to && step < 2) {setStep(2)}

    window.Telegram.WebApp.HapticFeedback.selectionChanged();
  };

  const handleChangeDay = (day) => {
    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    setDays(newDays);
    if (newDays.length === 0) {
      setStep(2);
      setHours([]);
    } else if (step === 2 && newDays.length === 1) {
      setStep(3);
    }

    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleChangeHours = (hour) => {
    const newHours = hours.includes(hour) ? hours.filter((h) => h !== hour) : [...hours, hour];
    setHours(newHours);
    setAllowOccupiedSlots(true);
    newHours.length === 0 ? setStep(3) : setStep(4);
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleChangeAllowOccupiedSlots = (checked) => {
    setAllowOccupiedSlots(checked)
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleSubmit = async() => {
    let apiUrl;
    const daysOfWeek = days.map(day => dayOptions.indexOf(day));
    const slotCount = countDaysInRange(dateRange.from, dateRange.to, daysOfWeek) * hours.length;
    let data = {
      branch,
      startDate: dateRange.from,
      endDate: dateRange.to,
      timeRanges: hours.map(hour => `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`),
      daysOfWeek,
      userId,
      initDataUnsafe
    };

    if (action === 'add') {
      data = {...data, allowOccupiedSlots}
      apiUrl = '/api/addRotaMulti';
    } else if (action === 'remove') {
      apiUrl = '/api/removeRotaMulti';
    }

    const requestPromise = api.post(apiUrl, data);
    
    toast.promise(
      requestPromise,
      {
        pending: 'Обновляю график...',
        success: {
          render({ data }) {
            return `Изменено ${data.data.modifiedCount} смен из ${slotCount}`;
          }
        },
        error: {
          render({ data }) {
            return `Ошибка #${data.status}`;
          }
        }
      }
    )

    try {
      const response = await requestPromise;
    } catch (error) {
      console.error(error);
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-6 px-3 pt-3 pb-6">
      {/* Action Selection */}
      <div className="w-full space-y-2">
        <p className="text-sm font-semibold text-muted-foreground text-center">
          Выберите действие
        </p>
        <ButtonGroup className="w-full flex justify-center">
          {Object.keys(actionOptions).map((btn) => (
            <Button
              key={btn}
              className="flex-1"
              variant={btn === action ? "default" : "outline"}
              onClick={() => handleChangeAction(btn)}
            >
              {actionOptions[btn]}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Date Range */}
      {step >= 1 && (
        <div className="w-full space-y-2">
          <p className="text-sm font-semibold text-muted-foreground text-center">Выберите период</p>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => handleChangeDateRange(range)}
            locale={ru}
            weekStartsOn={1}
            className="rounded-lg border dark:border-input shadow-sm mx-auto"
          />
        </div>
      )}

      {/* Days of the Week */}
      {step >=2 && (
        <div className="w-full space-y-2">
          <p className="text-sm font-semibold text-muted-foreground text-center">
            Дни недели
          </p>
          <ButtonGroup className="w-full flex justify-center flex-wrap">
            {dayOptions.map((day) => (
              <Button
                key={day}
                className="px-3.5"
                variant={days.includes(day) ? "default" : "outline"}
                onClick={() => handleChangeDay(day)}
              >
                {day}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      )}

      {/* Hours of the day */}
      {step >= 3 && (
        <div className="w-full space-y-2">
          <p className="text-sm font-semibold text-muted-foreground text-center">
            Часы
          </p>
            <div className='w-full grid grid-cols-6 gap-2'>
              {hourOptions.map((hour) => {
                return (
                  <Button
                    key={hour}
                    variant={hours.includes(hour) ? "default" : "outline"}
                    onClick={() => handleChangeHours(hour)}
                    className="text-xs py-1"
                  >
                    {`${String(hour).padStart(2, "0")}:00`}
                  </Button>
                )
              })}
            </div>
        </div>
      )}

      {/* allowOccupiedSlots */}
      {step >= 4 && (
        <>
          {action === 'add' && (
            <div className="w-full">
              <Field orientation="horizontal" className="justify-center">
                <Checkbox
                  id="allowOccupiedSlots"
                  checked={allowOccupiedSlots}
                  onCheckedChange={(checked) => handleChangeAllowOccupiedSlots(checked)}
                />
                <FieldContent>
                  <FieldLabel htmlFor="allowOccupiedSlots">
                    Ставить в занятые смены
                  </FieldLabel>
                  <FieldDescription>
                    Отключите опцию если не хотите добавлять дежурного на уже занятую смену
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>
          )}

          {/* Submit Button */}
          <Button
            size="lg"
            className="w-full font-semibold"
            onClick={() => handleSubmit()}
          >
            Сохранить
          </Button>
        </>
      )}

      <ToastContainer
        position='bottom-center'
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        theme={window.Telegram.WebApp.colorScheme}
        limit={4}
      />
    </div>
  )
};