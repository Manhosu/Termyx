export default function AdminActivityLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-5 w-56 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-11 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-11 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-11 w-36 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Activity List Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
          >
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
