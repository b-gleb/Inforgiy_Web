import UserSearch, {UserSearchProps} from "./UserSearch";
import { useGetUsers } from "@/hooks/userHooks";

interface UserSearchContainerProps extends Omit<UserSearchProps, 'status' | 'users'> {
  department: string;
  initDataUnsafe: object;
}

export default function UserSearchContainer({
  department,
  showAddUserButton,
  initDataUnsafe,
  onSelectUser,
  onAddUser,
  onClose
}: UserSearchContainerProps) {
  const { status, data } = useGetUsers({branch: department, initDataUnsafe})
  return (
    <div className="popup">
      <UserSearch
        status={status}
        users={data}
        showAddUserButton={showAddUserButton}
        onSelectUser={onSelectUser}
        onAddUser={onAddUser}
        onClose={onClose}
      />;
    </div>
  )
}