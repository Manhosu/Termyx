export default function AdminPaymentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
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
            <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-11 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-11 w-36 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-11 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          {['ID', 'Usuario', 'Tipo', 'Valor', 'Status', 'Data'].map((col) => (
            <div key={col} className="h-4 w-16 bg-neutral-300 dark:bg-neutral-700 rounded" />
          ))}
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
          >
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded self-center font-mono" />
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded self-center" />
            <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full self-center" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded self-center" />
            <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full self-center" />
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded self-center" />
          </div>
        ))}
      </div>
    </div>
  )
}
