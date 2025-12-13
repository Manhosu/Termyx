export default function DocumentDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />

      {/* Header Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-2" />
            <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-neutral-200 dark:border-neutral-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Preview Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
        <div className="aspect-[1/1.414] w-full max-w-2xl mx-auto bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>
    </div>
  )
}
