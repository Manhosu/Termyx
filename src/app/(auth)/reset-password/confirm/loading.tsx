export default function ResetPasswordConfirmLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md animate-pulse">
        {/* Card Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
          {/* Icon */}
          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-4" />
          {/* Title */}
          <div className="h-8 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto mb-2" />
          {/* Description */}
          <div className="h-5 w-52 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto mb-6" />

          {/* Password Input Label */}
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
          {/* Password Input */}
          <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-3" />
          {/* Password Checks */}
          <div className="space-y-1 mb-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
            ))}
          </div>

          {/* Confirm Password Input Label */}
          <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
          {/* Confirm Password Input */}
          <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-5" />

          {/* Button */}
          <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
