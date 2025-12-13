export default function HelpLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center">
        <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg mx-auto mb-4" />
        <div className="h-5 w-72 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto" />
      </div>

      {/* Search Skeleton */}
      <div className="h-14 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />

      {/* Categories Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-4" />
            <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>

      {/* FAQ Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
