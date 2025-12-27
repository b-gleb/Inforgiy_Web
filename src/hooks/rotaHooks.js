import { useEffect, useState } from "react";
import { addDays, subDays, format } from "date-fns";
import { getUserDuties } from "@/services/api.ts";

export function useUserDuties({
  branch,
  userId,
  prevDays = 0,
  nextDays = 14
}) {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getDuties = async () => {
      try {
        const today = new Date();
        const startDate = format(subDays(today, prevDays), "yyyy-MM-dd");
        const endDate = format(addDays(today, nextDays), "yyyy-MM-dd");

        const { data } = await getUserDuties({
          branch,
          userId,
          startDate,
          endDate,
        });

        setDuties(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (branch && userId) {
      getDuties();
    }
  }, [branch, userId, prevDays, nextDays]);

  return {
    duties,
    loading,
    error
  }
};
