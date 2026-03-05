
"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Tractor, DollarSign, Check, Loader2, ClipboardList, CheckCircle2 } from "lucide-react"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, doc, limit } from "firebase/firestore"
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { format, differenceInMinutes, isToday, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { AttendanceRecord, PayrollSummary, FarmTask, TaskStatus, ProductivityEntry } from "@/lib/types"
import { ProductivityFormDialog } from "@/components/productivity-form-dialog"

const statusVariant: { [key in TaskStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Completed: 'default',
  'In Progress': 'secondary',
  Pending: 'outline',
};

export function FarmWorkerDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isClocking, setIsClocking] = React.useState(false);

  // --- DATA FETCHING ---
  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(
      collection(firestore, 'attendance'),
      where('workerId', '==', user.uid),
      where('date', '==', todayStr),
      limit(1)
    );
  }, [firestore, user]);
  const { data: attendanceData, isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);
  const todaysRecord = attendanceData?.[0];

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'tasks'),
      where('assignedWorkerIds', 'array-contains', user.uid)
    );
  }, [firestore, user]);
  const { data: tasksData, isLoading: isTasksLoading } = useCollection<FarmTask>(tasksQuery);

  const productivityQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'productivity'),
        where('workerId', '==', user.uid)
    );
  }, [firestore, user]);
  const { data: productivityData } = useCollection<ProductivityEntry>(productivityQuery);
  
  const payrollQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return query(
      collection(firestore, 'payroll'),
      where('workerId', '==', user.uid),
      where('month', '==', currentMonth),
      where('year', '==', currentYear),
      limit(1)
    );
  }, [firestore, user]);
  const { data: payrollData } = useCollection<PayrollSummary>(payrollQuery);
  
  // --- CALCULATIONS & STATE ---
  const isLoading = isAttendanceLoading || isTasksLoading;

  const isClockedIn = todaysRecord && !todaysRecord.timeOut;
  const hasClockedOut = todaysRecord && todaysRecord.timeOut;

  const todaysTasks = React.useMemo(() => 
    tasksData?.filter(task => isToday(parseISO(task.deadline))) || []
  , [tasksData]);
  
  const tasksCompletedToday = React.useMemo(() => 
    tasksData?.filter(task => task.status === 'Completed' && task.completedAt && isToday(parseISO(task.completedAt))).length || 0
  , [tasksData]);
  
  const todaysOutput = React.useMemo(() => {
      return productivityData
        ?.filter(entry => isToday(parseISO(entry.date)))
        .reduce((sum, entry) => sum + entry.outputQuantity, 0) || 0;
  }, [productivityData]);

  const estimatedEarnings = payrollData?.[0] ? `$${payrollData[0].totalPaymentDue.toFixed(2)}` : "-";

  // --- HANDLERS ---
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
    
    addDocumentNonBlocking(collection(firestore, 'attendance'), newRecord);
    toast({ title: "Clocked In", description: "Your shift has started." });
    setIsClocking(false);
  };

  const handleClockOut = async () => {
    if (!firestore || !user || !todaysRecord) return;
    setIsClocking(true);
    const recordRef = doc(firestore, 'attendance', todaysRecord.id);
    const timeIn = new Date(todaysRecord.timeIn);
    const timeOut = new Date();
    const hours = differenceInMinutes(timeOut, timeIn) / 60;

    updateDocumentNonBlocking(recordRef, {
      timeOut: timeOut.toISOString(),
      totalHoursWorked: hours,
    });
    toast({ title: "Clocked Out", description: "Your shift has ended." });
    setIsClocking(false);
  };

  const handleUpdateTaskStatus = (task: FarmTask, status: TaskStatus) => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'tasks', task.id);
    const updatePayload: { status: TaskStatus, completedAt?: string } = { status };
    if (status === 'Completed') {
      updatePayload.completedAt = new Date().toISOString();
    }
    updateDocumentNonBlocking(taskRef, updatePayload);
    toast({ title: `Task ${status}`, description: `Task "${task.taskType}" marked as ${status}.` });
  }

  // --- RENDER LOGIC ---
  const getClockButton = () => {
    if (isLoading || isClocking) {
        return <Button className="w-full" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait</Button>;
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
    if (isLoading) return "Loading status...";
    if (hasClockedOut) return `You clocked out. Total hours: ${todaysRecord.totalHoursWorked?.toFixed(2) || 0}`;
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
          title="Tasks Assigned Today"
          value={String(todaysTasks.length)}
          icon={ClipboardList}
          description="Total tasks for you today"
        />
        <StatCard
          title="Tasks Completed Today"
          value={String(tasksCompletedToday)}
          icon={CheckCircle2}
          description="Your completed tasks"
        />
        <StatCard
          title="Total Output Today"
          value={`${todaysOutput} kg`}
          icon={Tractor}
          description="Your total output today"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Assigned Tasks</CardTitle>
            <CardDescription>Here are the tasks you need to work on today.</CardDescription>
          </div>
           <ProductivityFormDialog>
                <Button>
                    <Check className="mr-2 h-4 w-4" /> Log Your Work
                </Button>
            </ProductivityFormDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isTasksLoading ? (
                 <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
              ) : todaysTasks.length > 0 ? (
                todaysTasks.map(task => (
                    <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.taskType} - <span className="text-muted-foreground">{task.cropType}</span></TableCell>
                    <TableCell>
                        <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        {task.status === 'Pending' && <Button variant="outline" size="sm" onClick={() => handleUpdateTaskStatus(task, 'In Progress')}>Start Task</Button>}
                        {task.status === 'In Progress' && <Button variant="default" size="sm" onClick={() => handleUpdateTaskStatus(task, 'Completed')}>Complete Task</Button>}
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
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
