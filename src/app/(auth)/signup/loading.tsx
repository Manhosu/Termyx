export default function SignupLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <div className="w-full max-w-md animate-pulse">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-9 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg mx-auto mb-2" />
          <div className="h-5 w-52 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto" />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
          {/* Name Field */}
          <div className="mb-5">
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>

          {/* Email Field */}
          <div className="mb-5">
            <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>

          {/* Password Field */}
          <div className="mb-5">
            <div className="h-4 w-14 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-3" />
            {/* Password Requirements */}
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
              ))}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-800 rounded mt-1" />
            <div className="h-10 flex-1 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>

          {/* Submit Button */}
          <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-6" />

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-6 bg-neutral-200 dark:bg-neutral-800 rounded mx-4" />
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Login Link */}
          <div className="h-5 w-44 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto" />
        </div>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <div className="h-5 w-36 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto mb-2" />
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
