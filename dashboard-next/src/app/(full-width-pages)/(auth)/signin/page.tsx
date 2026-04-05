import SignInForm from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Sign In - AvdheshanandG Mission Admin',
  description: 'Admin portal for AvdheshanandG Mission - Serving humanity through Gau Seva, Education, and Healthcare',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding & Mission */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950 dark:via-gray-900 dark:to-amber-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-orange-500 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-orange-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-amber-600 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              ॐ AvdheshanandG Mission
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
          </div>

          {/* Mission Statement */}
          <div className="space-y-6 max-w-lg">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Admin Portal for managing the divine work of <span className="font-semibold text-orange-600 dark:text-orange-400">Swami Avdheshanand Giri Ji Maharaj</span>
            </p>

            {/* Mission Pillars */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">🐄</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Gau Seva</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Protecting and serving our sacred cows</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Education for All</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Empowering through knowledge</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">🏥</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Free Healthcare</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Healing with compassion</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 mt-8">
          <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-600 dark:text-gray-400">
            &quot;Service to humanity is service to God&quot;
            <footer className="text-sm mt-2 text-gray-500 dark:text-gray-500 not-italic">
              — Inspired by Vedic Wisdom
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              ॐ AvdheshanandG Mission
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Admin Portal</p>
            <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto mt-2"></div>
          </div>

          {/* Sign In Form */}
          <SignInForm />

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Authorized personnel only. Protected by authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
