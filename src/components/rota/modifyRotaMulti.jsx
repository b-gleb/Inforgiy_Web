import { useState} from 'react';
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


export default function ModifyRotaMulti({ branch, userId }) {
  const [step, setStep] = useState(0);
  const [action, setAction] = useState(null);
  const [dateRange, setDateRange] = useState(undefined);
  const [days, setDays] = useState([]);
  const [hours, setHours] = useState([]);
  const [allowOccupied, setAllowOccupied] = useState(true);

  const actionOptions = {
    'add': '+ Добавить',
    'remove': '– Удалить'
  };
  const dayOptions = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const hourOptions = Array.from({ length: 24 }, (_, i) => String(i + 1));

  const handleChangeAction = (selected) => {
    if (selected !== action) {
      setAction(selected);
      setStep(1);
      setDateRange(undefined);
      setDays([]);
      setHours([]);
      setAllowOccupied(true);
    }

    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleChangeDateRange = (range) => {
    setDateRange(range);
    if (range === undefined || range.from === range.to) {setStep(1); setDays([]); setHours([]);}
    if (range !== undefined && range.from !== range.to) {setStep(2)}

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
    setAllowOccupied(true);
    newHours.length === 0 ? setStep(3) : setStep(4);

    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleChangeAllowOccupied = (checked) => {
    setAllowOccupied(checked)
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  };

  return (
    // TODO: Unify labels
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-6 px-3 pt-3 pb-6">
      {/* Action Selection */}
      <div className="w-full space-y-2">
        <p className="text-sm font-semibold text-gray-700 text-center">
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
        <div className="w-full space-y-2 text-center">
          <p className="text-sm font-semibold text-gray-700">Выберите период</p>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => handleChangeDateRange(range)}
            locale={ru}
            weekStartsOn={1}
            className="rounded-lg border shadow-sm mx-auto"
          />
        </div>
      )}

      {/* Days of the Week */}
      {step >=2 && (
        <div className="w-full space-y-2">
          <p className="text-sm font-semibold text-gray-700 text-center">
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
          <p className="text-sm font-semibold text-gray-700 text-center">
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

      {/* allowOccupied */}
      {step >= 4 && (
        <>
          <div className="w-full">
            <Field orientation="horizontal" className="justify-center">
              <Checkbox
                id="allowOccupied"
                checked={allowOccupied}
                onCheckedChange={(checked) => handleChangeAllowOccupied(checked)}
              />
              <FieldContent>
                <FieldLabel htmlFor="allowOccupied">
                  Ставить в занятые смены
                </FieldLabel>
                <FieldDescription>
                  Отключите опцию если не хотите добавлять дежурного на уже занятую смену
                </FieldDescription>
              </FieldContent>
            </Field>
          </div>

          {/* Submit Button */}
          <Button
            size="lg"
            className="w-full"
            // TODO: add onclick
          >
            Сохранить
          </Button>
        </>
      )}
    </div>
  )
};