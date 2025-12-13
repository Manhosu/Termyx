export default function TemplatesLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-5 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
        </div>
        <div className="h-10 w-72 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Templates Grid Skeleton */}
      {[1, 2].map((section) => (
        <section key={section}>
          <div className="h-6 w-28 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
              >
                <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-4" />
                <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded mb-1" />
                <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
