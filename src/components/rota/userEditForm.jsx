import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { userColors } from '../../utils/userColors.js';
import api from '../../services/api.js';
import catchResponseError from '../../utils/responseError';


export default function UserEditForm({ branch, User, initDataUnsafe }){
    const navigate = useNavigate();
    const [editingUser, setEditingUser] = useState(User)
  
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
        const response = await api.post('/api/removeUser', {
          branch: branch,
          modifyUserId: user_id,
          initDataUnsafe: initDataUnsafe
        })
  
        if (response.status === 200){
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          toast.success('Пользователь удален!');
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
        const response = await api.post('/api/updateUser', data);
  
        if (response.status === 200){
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          navigate('/Inforgiy_Web/', { state: {
            showUserManagement: true,
            toastMessage: 'Пользователь обновлен!'
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
                navigate('/Inforgiy_Web/', { state: { showUserManagement: true } });   
              }}
            >
              <Trash2 color='red' size={25}/>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
              navigate('/Inforgiy_Web/', { state: { showUserManagement: true } });
            }}
            className="button-secondary w-full">
            Отменить
          </button>

          <button type="submit" className="button-primary">Сохранить</button>
        </div>
      </form>
      </>
    )
  }