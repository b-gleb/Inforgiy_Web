import { toast } from 'react-toastify';

export default function catchResponseError(error){
    console.error(error.code, error.status,  error.response.data);
    toast.error(`Ошибка ${error.status}: ${error.response.data}`);
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
}