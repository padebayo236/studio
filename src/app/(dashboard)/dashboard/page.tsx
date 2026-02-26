'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2 } from 'lucide-react';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { FarmManagerDashboard } from '@/components/dashboard/farm-manager-dashboard';
import { FarmWorkerDashboard } from '@/components/dashboard/farm-worker-dashboard';
import { AccountantDashboard } from '@/components/dashboard/accountant-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function DashboardPage() {
  const { user, userProfile, isLoading, error } = useUserProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-full flex-1 items-center justify-center">
            <Card className="w-1/2">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not load user profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>There was a problem fetching your user data. This might be a permission issue or a network problem.</p>
                    <pre className="mt-4 whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{error.message}</pre>
                    <Button onClick={() => router.replace('/login')} className="mt-4">
                        Go to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!user || !userProfile) {
    // This can happen briefly before redirect, or if auth fails silently.
    // The auth guard in the layout will handle redirect. Show a loader.
    return (
        <div className="flex h-full flex-1 items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      );
  }

  switch (userProfile.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'FarmManager':
      return <FarmManagerDashboard />;
    case 'FarmWorker':
      return <FarmWorkerDashboard />;
    case 'Accountant':
      return <AccountantDashboard />;
    default:
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Unknown Role</CardTitle>
                  <CardDescription>Your user role is not recognized.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p>Please contact an administrator to get a valid role assigned to your account.</p>
              </CardContent>
          </Card>
      )
  }
}

export default DashboardPage;
