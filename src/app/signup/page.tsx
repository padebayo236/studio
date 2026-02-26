import { SignUpForm } from '@/components/auth/signup-form';
import { AgriProLogo } from '@/components/icons';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <AgriProLogo className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-semibold tracking-tight">
                    AgriPro Manager
                </h1>
            </div>
          <h2 className="text-xl font-semibold tracking-tight">
            Create an account
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <SignUpForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
