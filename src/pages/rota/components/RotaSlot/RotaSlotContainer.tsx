import { Suspense, lazy, useState, useEffect } from "react";
import RotaSlot, {RotaSlotProps} from "./RotaSlot";

const UserSearchPopUp = lazy(
  () => import('@/components/userSearchPopUp')
);

interface RotaSlotContainerProps extends Omit<RotaSlotProps, 'onOpenUserSearch'> {}

export default function RotaSlotContainer(props: RotaSlotContainerProps) {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (showSearch) { 
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showSearch]);

  return (
    <>
      <RotaSlot
        {...props}
        onOpenUserSearch={() => setShowSearch(true)}
      />

      {/* {showSearch && (
        <Suspense fallback={null}>
          <UserSearchPopUp
            mode='rota'
            branch={props.department}
            date={date}
            timeRange={props.label}
            initDataUnsafe={initDataUnsafe}
            onClose={() => setShowSearch(false)}
          />
        </Suspense>
      )} */}
    </>
  );
}