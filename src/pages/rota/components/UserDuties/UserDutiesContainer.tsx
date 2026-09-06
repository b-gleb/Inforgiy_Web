import UserDuties from "./UserDuties";
import { useUserDuties } from "@/hooks/rotaHooks";

export interface UserDutiesContainerProps {
  branch: string;
  userId: number;
  prevDays: number;
  nextDays: number;
}

export default function UserDutiesContainer({
  branch,
  userId,
  prevDays,
  nextDays,
}: UserDutiesContainerProps) {
  const { status, data } = useUserDuties({ branch, userId, prevDays, nextDays });
  return <UserDuties status={status} data={data} />;
}
