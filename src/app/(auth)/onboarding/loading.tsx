export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-lg animate-pulse">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
          {/* Title */}
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg mx-auto mb-2" />
          <div className="h-5 w-72 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto mb-8" />

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
              <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>

            {/* Category Selection */}
            <div>
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <div className="h-12 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-12 flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
