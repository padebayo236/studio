
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAttendance, useWorkers } from '@/hooks/data/use-operational-data';
import type { AttendanceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendancePage() {
  const { user, userProfile, isLoading: isProfileLoading } = useUserProfile();
  const router = useRouter();

  const { data: allRecords, isLoading: isAttendanceLoading, error } = useAttendance();
  const { data: allWorkers, isLoading: isWorkersLoading } = useWorkers();

  const workerNameMap = React.useMemo(() => {
    if (!allWorkers) return new Map<string, string>();
    return new Map(allWorkers.map(w => [w.id, w.name]));
  }, [allWorkers]);
  
  const records = React.useMemo(() => {
    if (!allRecords) return [];
    if (userProfile?.role === 'FarmWorker') {
      return allRecords.filter(record => record.workerId === user?.uid);
    }
    return allRecords;
  }, [allRecords, userProfile, user]);

  const isDataLoading = isProfileLoading || isAttendanceLoading || isWorkersLoading;

  if (isDataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!userProfile || !['Admin', 'FarmManager', 'Accountant', 'FarmWorker'].includes(userProfile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please contact an administrator if you believe this is an error.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
        <CardDescription>
          Daily attendance records for all farm workers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">
                  Error loading attendance data: {error.message}
                </TableCell>
              </TableRow>
            ) : records && records.length > 0 ? (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{workerNameMap.get(record.workerId) || record.workerId}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.timeIn ? format(new Date(record.timeIn), 'p') : '- N/A -'}</TableCell>
                  <TableCell>{record.timeOut ? format(new Date(record.timeOut), 'p') : '- N/A -'}</TableCell>
                  <TableCell className="text-right">{record.totalHoursWorked?.toFixed(2) || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
