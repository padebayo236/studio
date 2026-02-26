
"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Hourglass, Tractor, DollarSign, Check, Loader2 } from "lucide-react"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, doc, limit } from "firebase/firestore"
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { format, differenceInMinutes } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { AttendanceRecord } from "@/lib/types"

// Dummy data for now
const todaysTasks = [
  { id: 'T004', name: 'Irrigation', field: 'North Field', status: 'In Progress' },
  { id: 'T005', name: 'Fertilizer Application', field: 'South Field', status: 'Pending' },
];

export function FarmWorkerDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isClocking, setIsClocking] = React.useState(false);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(
      collection(firestore, 'farm_workers', user.uid, 'attendance_records'),
      where('date', '==', todayStr),
      limit(1)
    );
  }, [firestore, user]);

  const { data: attendanceData, isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);
  
  const todaysRecord = attendanceData?.[0];
  const isClockedIn = todaysRecord && !todaysRecord.timeOut;
  const hasClockedOut = todaysRecord && todaysRecord.timeOut;

  const handleClockIn = async () => {
    if (!firestore || !user) return;
    setIsClocking(true);
    const newRecord: Omit<AttendanceRecord, 'id'> = {
      workerId: user.uid,
      date: format(new Date(), 'yyyy-MM-dd'),
      timeIn: new Date().toISOString(),
      timeOut: null,
      totalHoursWorked: null,
      createdAt: new Date().toISOString(),
    };
    
    addDocumentNonBlocking(collection(firestore, 'farm_workers', user.uid, 'attendance_records'), newRecord);
    toast({ title: "Clocked In", description: "Your shift has started." });
    setIsClocking(false);
  };

  const handleClockOut = async () => {
    if (!firestore || !user || !todaysRecord) return;
    setIsClocking(true);
    const recordRef = doc(firestore, 'farm_workers', user.uid, 'attendance_records', todaysRecord.id);
    const timeIn = new Date(todaysRecord.timeIn);
    const timeOut = new Date();
    // Calculate hours with decimals
    const hours = differenceInMinutes(timeOut, timeIn) / 60;

    updateDocumentNonBlocking(recordRef, {
      timeOut: timeOut.toISOString(),
      totalHoursWorked: hours,
    });
    toast({ title: "Clocked Out", description: "Your shift has ended." });
    setIsClocking(false);
  };

  const getClockButton = () => {
    if (isAttendanceLoading || isClocking) {
        return (
            <Button className="w-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>
        );
    }
    if (hasClockedOut) {
        return <Button className="w-full" disabled>Clocked Out for Today</Button>
    }
    if (isClockedIn) {
        return <Button onClick={handleClockOut} className="w-full" variant="destructive">Clock Out</Button>
    }
    return <Button onClick={handleClockIn} className="w-full">Clock In</Button>
  }
  
  const getStatusMessage = () => {
    if (isAttendanceLoading) return "Loading status...";
    if (hasClockedOut) return `You clocked out for today. Total hours: ${todaysRecord.totalHoursWorked?.toFixed(2) || 0}`;
    if (isClockedIn) return `Clocked in since ${format(new Date(todaysRecord.timeIn), 'p')}.`;
    return "You are currently clocked out.";
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Status</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {getClockButton()}
                <p className="text-xs text-muted-foreground mt-2 h-8">
                    {getStatusMessage()}
                </p>
            </CardContent>
        </Card>
        <StatCard
          title="Hours This Week"
          value={"-"}
          icon={Hourglass}
          description="Total hours worked"
        />
        <StatCard
          title="Total Output"
          value={"-"}
          icon={Tractor}
          description="Your total output this month"
        />
        <StatCard
          title="Estimated Earnings"
          value={"-"}
          icon={DollarSign}
          description="This month's estimated earnings"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Assigned Tasks</CardTitle>
          <CardDescription>Here are the tasks you need to work on today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaysTasks.length > 0 ? (
                todaysTasks.map(task => (
                    <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{task.field}</TableCell>
                    <TableCell>
                        <Badge variant={task.status === 'In Progress' ? 'secondary' : 'destructive'}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Completed
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No tasks assigned for today.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
