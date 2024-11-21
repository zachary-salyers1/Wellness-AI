import { AuthForm } from '@/components/auth/auth-form';

export default function AuthPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          Wellness Hub
        </div>
        <div className="relative z-20 mt-auto">
          <h1 className="text-4xl font-semibold tracking-tight">
            Track your fitness journey
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Join us to track your workouts, plan your nutrition, and achieve your wellness goals.
          </p>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}