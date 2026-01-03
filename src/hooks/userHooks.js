import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUser, removeUser } from "@/services/api.ts";
import catchResponseError from '@/utils/responseError';
import { toast } from "react-toastify";

export function useGetUsers(
  { branch, initDataUnsafe },
  options = {}
) {
  return useQuery({
    queryKey: ['users', branch],
    queryFn: () => getUsers({ branch, initDataUnsafe }),
    staleTime: 5 * 60 * 1000,
    ...options
  })
};

export const useUpdateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['users', variables.branch]);
      toast.success('Пользователь обновлен!');
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => {
      if (error.response.status === 404) {
        toast.warn('Пользователь не найден!');
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        catchResponseError(error);
      }
    },
    ...options
  })
};

export const useRemoveUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUser,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['users', variables.branch]);
      toast.success("Пользователь удален!");
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => {
      catchResponseError(error);
    }
  });
};
