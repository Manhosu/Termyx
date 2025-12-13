export default function PrivacyLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          <div>
            <div className="h-8 w-56 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-4 w-72 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-52 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
