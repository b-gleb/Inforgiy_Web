import { lazy, Suspense, useEffect, useState } from "react";
// API
import { useUpdateRota } from "@/hooks/rotaHooks";
import RotaSlot, { RotaSlotProps } from "./RotaSlot";

// Lazy Loading
const UserSearchContainer = lazy(
  () => import("@/components/UserSearch/UserSearchContainer")
);

interface SearchInfo {
  timeRange: string;
}

interface RotaSlotContainerProps extends Omit<RotaSlotProps, "onOpenUserSearch"> {
  /** The date string (yyyy-MM-dd) for the currently displayed rota day */
  date: string;
  /** Telegram initDataUnsafe object, forwarded to mutations that require auth */
  initDataUnsafe: object;
}

export default function RotaSlotContainer({
  date,
  initDataUnsafe,
  ...props
}: RotaSlotContainerProps) {
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const updateRota = useUpdateRota();

  useEffect(() => {
    if (searchInfo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [searchInfo]);

  return (
    <>
      <RotaSlot
        {...props}
        onOpenUserSearch={(timeRange: string) => setSearchInfo({ timeRange })}
      />

      {searchInfo && (
        <Suspense fallback={null}>
          <UserSearchContainer
            department={props.department}
            showAddUserButton={false}
            initDataUnsafe={initDataUnsafe}
            onSelectUser={userObj =>
              updateRota.mutate(
                {
                  type: "add",
                  branch: props.department,
                  date,
                  timeRange: searchInfo.timeRange,
                  userId: userObj.id,
                  initDataUnsafe
                },
                {
                  onSuccess: () => {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
                    setSearchInfo(null);
                  }
                }
              )
            }
            onClose={() => setSearchInfo(null)}
          />
        </Suspense>
      )}
    </>
  );
}
