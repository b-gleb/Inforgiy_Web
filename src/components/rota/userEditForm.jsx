import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Field, FieldLabel } from '@/components/ui/field.jsx';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { userColors } from '../../utils/userColors.js';
import { updateUser } from '@/services/api.ts';
import catchResponseError from '../../utils/responseError';
import { useRemoveUser } from '@/hooks/userHooks.js';


export default function UserEditForm({ branch, User, initDataUnsafe }){
    const navigate = useNavigate();
    const [editingUser, setEditingUser] = useState(User);
    const removeUser = useRemoveUser();
  
    const handleChange = (e) => {
      const {name, value} = e.target;
  
      if (name === 'color'){
        window.Telegram.WebApp.HapticFeedback.selectionChanged()
      }
  
      setEditingUser((prevUser) => ({
        ...prevUser,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const response = await updateUser({
          branch,
          userObj: editingUser,
          initDataUnsafe
        });
  
        if (response.status === 200){
          toast.success('Пользователь обновлен!');
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          navigate('/Inforgiy_Web/', { state: {
            showUserManagement: true
          } });
        };
      } catch (error) {
        // Handle error 404 separately
        if (error.response && error.response.status === 404){
          toast.warn('Пользователь не найден!');
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        } else {
          catchResponseError(error)
        };
      }
    }
  
    return(
      <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Field>
          <FieldLabel htmlFor="username">Telegram</FieldLabel>
          <Input
            id="username"
            name="username"
            value={editingUser.username}
            onChange={handleChange}
            required
            readOnly={editingUser.id !== null}
            autoComplete="off"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="nick">Ник</FieldLabel>
          <Input
            id="nick"
            name="nick"
            value={editingUser.nick}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="color">Цвет</FieldLabel>
          <Select
            id="color"
            name="color"
            value={String(editingUser.color)}
            onValueChange={(val) =>
              handleChange({ target: { name: "color", value: val } })
            }
          >
            <SelectTrigger>
              <SelectValue/>
            </SelectTrigger>

            <SelectContent>
              {Object.entries(userColors).map(([color_value, color_display]) => (
                <SelectItem key={color_value} value={String(color_value)}>
                  {color_display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className='flex space-x-2'>
        {editingUser.id !== null && (
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="flex-none"
              onClick={async () => {
                try {
                  await removeUser(branch, editingUser.id, initDataUnsafe);
                  navigate('/Inforgiy_Web/', { state: { showUserManagement: true } });
                } catch {
                  // error handled globaly by axios
                }   
              }}
            >
              <Trash2 color='red' className="size-6"/>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
              navigate('/Inforgiy_Web/', { state: { showUserManagement: true } });
            }}
          >
            Отменить
          </Button>

          <Button 
            type="submit"
            size="lg"
            className="flex-1 font-semibold"
          >
            Сохранить
          </Button>
        </div>
      </form>
      </>
    )
  }