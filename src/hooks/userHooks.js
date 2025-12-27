import { useCallback } from "react";
import { removeUser } from "@/services/api.ts";
import { toast } from "react-toastify";

export const useRemoveUser = () => {
  return useCallback(async (branch, userId, initDataUnsafe) => {
    const response = await removeUser({
      branch, userId, initDataUnsafe
    });
    
    if (response.status === 204) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      toast.success("Пользователь удален!");
    }

    return response;
  }, []);
}