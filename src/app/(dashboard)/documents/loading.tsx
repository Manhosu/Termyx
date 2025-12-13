export default function DocumentsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-5 w-56 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
        </div>
        <div className="h-11 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-11 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-11 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-11 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Documents Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            </div>
            <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
            <div className="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="h-8 flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
