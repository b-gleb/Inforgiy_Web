import { useCallback } from "react";
import { updateUser, removeUser } from "@/services/api.ts";
import catchResponseError from '@/utils/responseError';
import { toast } from "react-toastify";

export const useUpdateUser = () => {
  return useCallback(async (branch, userObj, initDataUnsafe) => {
    try {
      const response = await updateUser({
        branch , userObj, initDataUnsafe
      });

      toast.success('Пользователь обновлен!');
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');

      return response;

    } catch (error) {
      if (error.response.status === 404) {
        toast.warn('Пользователь не найден!');
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        return null;
      }

      // show general toast for all other error types
      catchResponseError(error);
      throw error;
    }


  }, []);
};

export const useRemoveUser = () => {
  return useCallback(async (branch, userId, initDataUnsafe) => {
    try {
      const response = await removeUser({
        branch, userId, initDataUnsafe
      });

      if (response.status === 204) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        toast.success("Пользователь удален!");
      }

      return response;
    } catch (error) {
      catchResponseError(error);
      throw error;
    }
  }, []);
};
