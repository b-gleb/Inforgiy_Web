import { useQuery } from '@tanstack/react-query';
import { getStats, getStatsCumulative } from "@/services/api";

export function useGetStats(
  {branch, userIds, dateRanges},
  options = {}
) {
  return useQuery({
    queryKey: ['overviewStats', branch, {userIds, dateRanges}],
    queryFn: () => getStats({branch, userIds, dateRanges}),
    staleTime: 5 * 60 * 1000,
    ...options
  })
};

export function useGetStatsCumulative(
  {branch, userId, dateRanges},
  options = {}
) {
  return useQuery({
    queryKey: ['cumulativeStats', branch, userId, {dateRanges}],
    queryFn: () => getStatsCumulative({branch, userId, dateRanges}),
    staleTime: 5 * 60 * 1000,
    ...options
  })
}
