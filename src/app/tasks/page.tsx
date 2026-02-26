
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { FarmTask, TaskStatus, Worker, FarmField } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';
import { TaskFormDialog } from '@/components/task-form-dialog';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format, isPast } from 'date-fns';

const statusVariant: { [key in TaskStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Completed: 'default',
  'In Progress': 'secondary',
  Pending: 'outline',
};

export default function TasksPage() {
  const { userProfile, isLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();
  const firestore = useFirestore();

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile) return null;
    if (userProfile.role === 'Admin') {
      return collection(firestore, 'tasks');
    }
    if (userProfile.role === 'FarmManager') {
      return query(
        collection(firestore, 'tasks'),
        where('managerId', '==', userProfile.id)
      );
    }
    return null;
  }, [firestore, userProfile]);

  const {
    data: tasksData,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useCollection<Omit<FarmTask, 'id'>>(tasksQuery);

  const workersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workersData } = useCollection<Omit<Worker, 'id'>>(workersRef);

  const fieldsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'fields') : null),
    [firestore]
  );
  const { data: fieldsData } = useCollection<Omit<FarmField, 'id'>>(fieldsRef);

  const workerMap = React.useMemo(() => 
    new Map(workersData?.map(w => [w.id, w.name]))
  , [workersData]);

  const fieldMap = React.useMemo(() =>
    new Map(fieldsData?.map(f => [f.id, f.name]))
  , [fieldsData]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!userProfile || !['Admin', 'FarmManager'].includes(userProfile.role)) {
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
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>
            Create, assign, and track all farm tasks.
          </CardDescription>
        </div>
        <TaskFormDialog>
            <Button>
                <PlusCircle className="mr-2" />
                Create Task
            </Button>
        </TaskFormDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Field</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Deadline</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTasksLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : tasksError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-destructive"
                >
                  Error loading tasks: {tasksError.message}
                </TableCell>
              </TableRow>
            ) : tasksData?.length ?? 0 > 0 ? (
              tasksData?.map((task) => {
                const deadline = new Date(task.deadline);
                const isTaskOverdue = isPast(deadline) && task.status !== 'Completed';
                return (
                    <TableRow key={task.id}>
                    <TableCell>
                        <div className="font-medium">{task.taskType}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                        {task.cropType}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={statusVariant[task.status]}>
                            {task.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{fieldMap.get(task.fieldId) || 'N/A'}</TableCell>
                    <TableCell>
                        {task.assignedWorkerIds?.map(id => workerMap.get(id)).join(', ') || 'Unassigned'}
                    </TableCell>
                    <TableCell className={`text-right ${isTaskOverdue ? 'text-destructive' : ''}`}>
                        {format(deadline, 'PP')}
                        {isTaskOverdue && <div className="text-xs font-semibold">Overdue</div>}
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <TaskFormDialog taskToEdit={task}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Edit
                                </DropdownMenuItem>
                            </TaskFormDialog>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                            Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
