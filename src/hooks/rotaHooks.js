import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, subDays, format } from "date-fns";
import { getRota, getUserDuties, updateRota, addRotaMulti, removeRotaMulti } from "@/services/api.ts";
import catchResponseError from '@/utils/responseError';


export function useRota(
  {
    branch,
    date
  },
  options = {}
) {
  return useQuery({
    queryKey: [
      'rota',
      branch,
      date
    ],
    queryFn: () => getRota({
      branch,
      date
    }),
    retry: false,
    enabled: !!branch,
    staleTime: 2 * 60 * 1000,
    ...options
  })
};

export function useUserDuties(
  {
    branch,
    userId,
    prevDays = 0,
    nextDays = 14,
  },
  options = {}
) {
  const today = new Date();
  const startDate = format(subDays(today, prevDays), 'yyyy-MM-dd');
  const endDate = format(addDays(today, nextDays), 'yyyy-MM-dd');

  return useQuery({
    queryKey: [
      'userDuties',
      branch,
      userId,
      prevDays,
      nextDays,
    ],
    queryFn: () => getUserDuties({
      branch,
      userId,
      startDate,
      endDate,
    }),
    enabled: !!branch && !!userId,
    staleTime: 2 * 60 * 1000,
    ...options
  })
};

export const useUpdateRota = (options = {}, rotaRefetchType = 'active') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRota,
    onSuccess: (data, variables, context) => {
      if (rotaRefetchType === 'active') {
        queryClient.setQueryData(['rota', variables.branch, variables.date], data);
      } else {
        queryClient.invalidateQueries({queryKey: ['rota', variables.branch, variables.date], refetchType: rotaRefetchType});
        queryClient.invalidateQueries({queryKey: ['userDuties', variables.branch, variables.userId]});
      };

      // TODO: Supposdely this oveerides the whole success callback, check across all queries.
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => catchResponseError(error),
    ...options
  });
};

export const useAddRotaMulti = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRotaMulti,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ['rota', variables.branch]});

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("error")
    },
    ...options
  });
};

export const useRemoveRotaMulti = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeRotaMulti,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ['rota', variables.branch]});

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("error")
    },
    ...options
  });
};