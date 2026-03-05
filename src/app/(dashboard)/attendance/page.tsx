
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Worker, AttendanceRecord } from '@/lib/types';
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
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  const router = useRouter();
  const firestore = useFirestore();

  // 1. Fetch all attendance and all workers
  const attendanceQuery = useMemoFirebase(() => firestore ? collection(firestore, 'attendance') : null, [firestore]);
  const { data: allRecords, isLoading: isAttendanceLoading, error } = useCollection<AttendanceRecord>(attendanceQuery);

  const workersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'workers') : null, [firestore]);
  const { data: allWorkers, isLoading: isWorkersLoading } = useCollection<Worker>(workersQuery);
  
  // 2. Create maps for efficient lookups
  const workerNameMap = React.useMemo(() => {
    if (!allWorkers) return new Map<string, string>();
    return new Map(allWorkers.map(w => [w.id, w.name]));
  }, [allWorkers]);
  
  const managedWorkerIds = React.useMemo(() => {
    if (!userProfile || !allWorkers) return new Set<string>();
    if (userProfile.role === 'FarmManager') {
      return new Set(allWorkers.filter(w => w.managerId === userProfile.id).map(w => w.id));
    }
    return new Set<string>();
  }, [userProfile, allWorkers]);

  // 3. Filter records based on role
  const records = React.useMemo(() => {
    if (!allRecords || !userProfile) return [];
    if (userProfile.role === 'Admin' || userProfile.role === 'Accountant') {
      return allRecords;
    }
    if (userProfile.role === 'FarmManager') {
      return allRecords.filter(record => managedWorkerIds.has(record.workerId));
    }
    return [];
  }, [allRecords, userProfile, managedWorkerIds]);
  
  const isDataLoading = isProfileLoading || isAttendanceLoading || isWorkersLoading;

  if (isDataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!userProfile || !['Admin', 'FarmManager', 'Accountant'].includes(userProfile.role)) {
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
            ) : records.length > 0 ? (
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
