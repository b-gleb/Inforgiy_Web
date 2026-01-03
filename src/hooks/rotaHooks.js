import { useQuery } from '@tanstack/react-query';
import { addDays, subDays, format } from "date-fns";
import { getUserDuties } from "@/services/api.ts";

// TODO: Needs to be invalidated if changed via main or calendar
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
