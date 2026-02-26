
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, PanelLeft, UserPlus, ListPlus } from 'lucide-react';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { AgriProLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { WorkerFormDialog } from '@/components/worker-form-dialog';
import { TaskFormDialog } from '@/components/task-form-dialog';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, isLoading, error } = useUserProfile();
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to login if auth check is complete and there's no user.
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Auth is loading, show a full-page spinner.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  
  // After loading, if there's no user, children won't be rendered anyway
  // because of the redirect, but this prevents a flash of content.
  if (!user) {
    return null;
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AgriProLogo className="h-6 w-6 text-primary" />
              <span className="">AgriPro Manager</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <MainNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <AgriProLogo className="h-6 w-6 text-primary" />
                  <span className="">AgriPro Manager</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <MainNav isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 items-center gap-2 flex">
            {(userProfile?.role === 'Admin' || userProfile?.role === 'FarmManager') && (
              <>
                <WorkerFormDialog>
                    <Button size="sm" variant="outline"><UserPlus/>Add Worker</Button>
                </WorkerFormDialog>
                <TaskFormDialog>
                    <Button size="sm" variant="outline"><ListPlus/>Assign Task</Button>
                </TaskFormDialog>
              </>
            )}
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
