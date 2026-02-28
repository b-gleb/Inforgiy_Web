import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, subDays, format } from "date-fns";
import { getUserDuties, updateRota, addRotaMulti, removeRotaMulti } from "@/services/api.ts";
import catchResponseError from '@/utils/responseError';

// TODO: Understand refetchActive & refetchInactive (see below)
// queryClient.invalidateQueries({
//   queryKey: ['userDuties'],
//   refetchActive: true,  // immediately refetch if component is mounted
//   refetchInactive: false, // only refetch mounted queries (default: true)
// });
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

export const useUpdateRota = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRota,
    onSuccess: (data, variables, context) => {
      // TODO: check invalidation is ok after GET rota is added to react-query
      queryClient.invalidateQueries({queryKey: ['rota', variables.branch, variables.date]});
      queryClient.invalidateQueries({queryKey: ['userDuties', variables.branch, variables.userId]})

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