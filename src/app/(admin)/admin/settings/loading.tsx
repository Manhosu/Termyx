export default function AdminSettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-5 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
      </div>

      {/* General Settings Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-4 w-56 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
              <div className="h-6 w-11 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Email Settings Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="h-11 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* API Settings Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="flex gap-2">
                <div className="h-11 flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                <div className="h-11 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Skeleton */}
      <div className="flex justify-end">
        <div className="h-11 w-36 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>
    </div>
  )
}
