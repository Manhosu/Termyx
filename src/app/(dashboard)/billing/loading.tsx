export default function BillingLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-5 w-72 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
      </div>

      {/* Current Plan Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-8 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="h-7 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Plans Grid Skeleton */}
      <div>
        <div className="h-6 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
            >
              <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
              <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
                ))}
              </div>
              <div className="h-11 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
