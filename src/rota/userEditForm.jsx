import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

import catchResponseError from '../utils/responseError';

const apiUrl = import.meta.env.VITE_PROXY_URL;

export default function UserEditForm({ branch, editingUser, setEditingUser, initDataUnsafe }){
    const userColors = {0: "Синий", 1: "Зелёный", 2: "Красный", 3: "Чёрный", 4: "Фиолетовый", 5: "Оранжевый", 6: "Жёлтый"};
  
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
  
    const handleRemoveUser = async (branch, user_id, initDataUnsafe) => {
      try {
        const response = await axios.post(`${apiUrl}/api/removeUser`, {
          branch: branch,
          modifyUserId: user_id,
          initDataUnsafe: initDataUnsafe
        })
  
        if (response.status === 200){
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          toast.success('Пользователь удален');
        };
  
      } catch (error) {
        catchResponseError(error);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const data = {
        branch: branch,
        userObj: editingUser,
        initDataUnsafe: initDataUnsafe
      };
  
      try {
        const response = await axios.post(`${apiUrl}/api/updateUser`, data);
  
        if (response.status === 200){
          setEditingUser(null);
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          toast.success('Пользователь обновлен!')
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
        <div>
          <label htmlFor="username" className="form-label">Telegram</label>
          <input
            type="text"
            id="username"
            name="username"
            value={editingUser.username}
            onChange={handleChange}
            required
            readOnly={editingUser.id !== null}
            autoComplete='off'
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="nick" className="form-label">Ник</label>
          <input
            type="text"
            id="nick"
            name="nick"
            value={editingUser.nick}
            onChange={handleChange}
            required
            autoComplete='off'
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="color" className="form-label">Цвет</label>
          <select
            id="color"
            name="color"
            value={editingUser.color}
            onChange={handleChange}
            className="input-field"
          >
            {Object.entries(userColors).map(([color_value, color_display]) => (
              <option key={color_value} value={color_value}>{color_display}</option>
            ))}
          </select>
        </div>
  
        
        <div className='flex space-x-2'>
        {editingUser.id !== null && (
            <button
              type="button"
              className="button-secondary w-auto"
              onClick={() => {
                handleRemoveUser(branch, editingUser.id, initDataUnsafe);
                setEditingUser(null);
              }}
            >
              <Trash2 color='red' size={25}/>
            </button>
          )}
          <button type="button" onClick={() => {setEditingUser(null); window.Telegram.WebApp.HapticFeedback.impactOccurred('light');}} className="button-secondary w-full">Отменить</button>
          <button type="submit" className="button-primary">Сохранить</button>
        </div>
      </form>
  
      </>
    )
  }