
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { AttendanceRecord, Worker } from '@/lib/types';
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
  const firestore = useFirestore();

  const [records, setRecords] = React.useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const workersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workersData } = useCollection<Omit<Worker, 'id'>>(workersRef);

  const workerNameMap = React.useMemo(() => {
    if (!workersData) return new Map();
    return workersData.reduce((acc, worker) => {
      acc.set(worker.id, worker.name);
      return acc;
    }, new Map<string, string>());
  }, [workersData]);

  React.useEffect(() => {
    if (isProfileLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!userProfile) {
        setIsDataLoading(false);
        return;
    }

    const fetchAttendance = async () => {
      if (!firestore) return;
      setIsDataLoading(true);

      try {
        let attendanceQuery;
        if (userProfile.role === 'Admin' || userProfile.role === 'Accountant') {
          attendanceQuery = query(collection(firestore, 'attendance'));
        } else if (userProfile.role === 'FarmManager') {
           const managedWorkersQuery = query(collection(firestore, 'workers'), where('managerId', '==', userProfile.id));
           const managedWorkersSnapshot = await getDocs(managedWorkersQuery);
           const workerIds = managedWorkersSnapshot.docs.map(doc => doc.id);
           
           if (workerIds.length === 0) {
             setRecords([]);
             setIsDataLoading(false);
             return;
           }

           // Firestore 'in' queries are limited to 30 items.
           // For managers with more workers, a more scalable solution would be needed.
           attendanceQuery = query(collection(firestore, 'attendance'), where('workerId', 'in', workerIds.slice(0, 30)));
        } else {
            // Workers should not access this page.
            setIsDataLoading(false);
            return;
        }

        const querySnapshot = await getDocs(attendanceQuery);
        const fetchedRecords = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(fetchedRecords);
      } catch (e: any) {
        setError(e);
        console.error("Error fetching attendance:", e);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchAttendance();
  }, [isProfileLoading, user, userProfile, firestore, router]);


  if (isProfileLoading || isDataLoading) {
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
            <Button onClick={() => router.push('/')} className="mt-4">
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
