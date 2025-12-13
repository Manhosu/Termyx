export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-5 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="h-6 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                    <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
