import { Skeleton } from '@/components/ui/skeleton';

export default function StatCard ({ label, sublabel, current, previous }) {
  const showComparison = previous !== undefined && previous !== null;
  const isPositive = showComparison && current > previous;
  const change = showComparison ? current - previous : 0;

  return (
    <div className="flex-1 p-2 rounded-2xl shadow-md bg-white dark:bg-neutral-800">
      <h3 className="text-base font-semibold mb-2 text-muted-foreground">{label}</h3>
      {current === null ? (
        <div className='space-y-2'>
          <Skeleton className="h-10 w-3/4"/>
          <Skeleton className="h-4 w-1/2"/>
        </div>
      ) : (
        <>
          <div className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{current}</div>
          {showComparison && (
            <div className="flex items-center">
              <span className={`text-[0.6rem] ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}
              </span>
              <span className="text-[0.6rem] ml-1 text-muted-foreground">{sublabel}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};