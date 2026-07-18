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
  const { onSuccess, onError, ...restOptions } = options;

  return useMutation({
    mutationFn: updateUser,
    ...restOptions,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ['users', variables.branch]});
      queryClient.invalidateQueries({queryKey: ['rota', variables.branch]});
      toast.success('Пользователь обновлен!');
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      if (error.response?.status === 404) {
        toast.warn('Пользователь не найден!');
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        catchResponseError(error);
      }
      onError?.(error, variables, context);
    },
  });
};

export const useRemoveUser = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options;

  return useMutation({
    mutationFn: removeUser,
    ...restOptions,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ['users', variables.branch]});
      toast.success("Пользователь удален!");
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      catchResponseError(error);
      onError?.(error, variables, context);
    },
  });
};
