export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-5 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
        </div>
        <div className="h-11 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
              <div>
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-7 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                  <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                </div>
                <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Templates Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="h-6 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
