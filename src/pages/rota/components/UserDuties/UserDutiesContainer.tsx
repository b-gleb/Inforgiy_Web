import UserDuties from "./UserDuties";
import { useUserDuties } from "@/hooks/rotaHooks";

export default function UserDutiesContainer({branch, userId, prevDays, nextDays}: {branch: string, userId: number, prevDays: number, nextDays: number}) {
  const {status, data} = useUserDuties({branch, userId, prevDays, nextDays});

  return (
    <UserDuties status={status} data={data}/>
  )
};
