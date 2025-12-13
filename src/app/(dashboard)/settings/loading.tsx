export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-5 w-72 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
      </div>

      {/* Profile Section Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="h-11 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <div className="h-11 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>

      {/* Security Section Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <div className="h-5 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mb-1" />
                <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
              <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
        <div className="h-6 w-28 bg-red-200 dark:bg-red-900/50 rounded mb-4" />
        <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
        <div className="h-10 w-32 bg-red-200 dark:bg-red-900/50 rounded-xl" />
      </div>
    </div>
  )
}
