import { Skeleton } from '@/components/ui/skeleton';
import { OctagonX } from 'lucide-react';
import { ApiStatus } from '@/types/apiStatus';

interface StatCardProps {
  /** API status */
  status: ApiStatus;
  /** Label for the period */
  label: string;
  /** Sublabel for the period */
  sublabel?: string;
  /** Statistic value for the period */
  value?: number;
  /** Statistics value for the previous period */
  previousValue?: number;
}

/** Information card showing statistics and comparing it to the previous period */
export default function StatCard({
  status,
  label,
  sublabel,
  value = 0,
  previousValue,
}: StatCardProps) {
  const showComparison = previousValue !== undefined && previousValue !== null;
  const change = showComparison ? value - previousValue : 0;
  const isPositive = showComparison && change > 0;
  const isNegative = showComparison && change < 0;
  const sign = isPositive ? '+' : isNegative ? '-' : '';

  return (
    <div className="flex-1 p-2 rounded-2xl shadow-md bg-white dark:bg-neutral-800">
      <h3 className="text-base font-semibold mb-2 text-muted-foreground">
        {label}
      </h3>

      {status === 'pending' && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-5/6" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      )}

      {status === 'error' && (
        <>
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
            <OctagonX className="h-4 w-4" />
            <span className="text-sm">Ошибка</span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Попробуйте позднее
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
            {value}
          </div>

          {showComparison && (
            <div className="flex items-center">
              <span
                className={`text-[0.6rem] ${
                  isPositive
                    ? 'text-green-500 dark:text-green-400'
                    : isNegative
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-muted-foreground'
                }`}
              >
                {sign}
                {Math.abs(change)}
              </span>

              <span className="text-[0.6rem] ml-1 text-muted-foreground">
                {sublabel}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}