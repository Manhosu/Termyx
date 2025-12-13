export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
        </div>
        <div className="h-11 w-36 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-11 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-11 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          {['Usuario', 'Email', 'Plano', 'Documentos', 'Acoes'].map((col) => (
            <div key={col} className="h-4 w-20 bg-neutral-300 dark:bg-neutral-700 rounded" />
          ))}
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded self-center" />
            <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full self-center" />
            <div className="h-4 w-8 bg-neutral-200 dark:bg-neutral-800 rounded self-center" />
            <div className="flex gap-2 self-center">
              <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
