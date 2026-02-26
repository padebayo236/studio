
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { PayrollSummary, Worker } from '@/lib/types';
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
import { Loader2, AlertTriangle, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PayrollPage() {
  const { userProfile, isLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();
  const firestore = useFirestore();

  const [filter, setFilter] = React.useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const payrollQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile) return null;
    if (!['Admin', 'Accountant'].includes(userProfile.role)) return null;
    return query(collection(firestore, 'payroll'));
  }, [firestore, userProfile]);

  const { data: payrolls, isLoading: isPayrollsLoading, error } = useCollection<PayrollSummary>(payrollQuery);
  
  const workersRef = useMemoFirebase(() => firestore && collection(firestore, 'workers'), [firestore]);
  const { data: workersData } = useCollection<Worker>(workersRef);
  const workerMap = React.useMemo(() => new Map(workersData?.map(w => [w.id, w.name])), [workersData]);

  const filteredPayrolls = React.useMemo(() => {
    return payrolls?.filter(p => p.month === filter.month && p.year === filter.year) || [];
  }, [payrolls, filter]);

  if (isAuthLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!userProfile || !['Admin', 'Accountant'].includes(userProfile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-1/2">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Access Denied</CardTitle><CardDescription>You do not have permission to view this page.</CardDescription></CardHeader>
          <CardContent><p>Please contact an administrator if you believe this is an error.</p><Button onClick={() => router.push('/')} className="mt-4">Go to Dashboard</Button></CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = isPayrollsLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Payroll Summaries</CardTitle>
          <CardDescription>View and manage monthly payroll for all workers.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            {/* Placeholder for month/year filter */}
            <Button>Generate New Payroll</Button>
            <Button variant="outline"><Download className="mr-2" /> Export All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead>Month/Year</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead className="text-right">Total Payment Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-destructive">Error: {error.message}</TableCell></TableRow>
            ) : filteredPayrolls.length > 0 ? (
              filteredPayrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-medium">{workerMap.get(payroll.workerId) || 'Unknown Worker'}</TableCell>
                  <TableCell>{payroll.month}/{payroll.year}</TableCell>
                  <TableCell>{payroll.totalHoursWorkedMonth.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${payroll.totalPaymentDue.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">No payroll records found for the selected period.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
