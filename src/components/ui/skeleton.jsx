import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-neutral-300 dark:bg-neutral-700 animate-pulse rounded-sm", className)}
      {...props} />
  );
}

export { Skeleton }
