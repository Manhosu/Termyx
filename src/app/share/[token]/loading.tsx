export default function ShareLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 animate-pulse">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Document Info */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
              <div>
                <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="flex items-center gap-4">
                  <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            </div>
            <div className="h-11 w-36 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>
        </div>

        {/* Document Preview */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
          <div className="bg-white rounded-xl border border-neutral-200 p-8 min-h-[400px]">
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded mt-8" />
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
