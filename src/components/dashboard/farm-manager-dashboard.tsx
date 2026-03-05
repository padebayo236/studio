
'use client';
import * as React from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Users,
  ClipboardList,
  UserCheck,
  Tractor,
  UserX,
  ClipboardCheck,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { format } from 'date-fns';
import type { FarmTask, Worker, ProductivityEntry } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

const taskChartConfig = {
    'Pending': { label: 'Pending', color: 'hsl(var(--chart-2))' },
    'In Progress': { label: 'In Progress', color: 'hsl(var(--chart-3))' },
    'Completed': { label: 'Completed', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const productivityChartConfig = {
    output: { label: 'Output (kg)', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;


export function FarmManagerDashboard() {
  const { userProfile } = useUserProfile();
  const firestore = useFirestore();
  
  const [stats, setStats] = React.useState({
    presentWorkers: 0,
    totalWorkers: 0,
    absentWorkers: 0,
    activeTasks: 0,
    completedTasks: 0,
    todaysOutput: 0,
  });

  const [taskStatusData, setTaskStatusData] = React.useState<any[]>([]);
  const [workerProductivity, setWorkerProductivity] = React.useState<any[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userProfile || !firestore || userProfile.role !== 'FarmManager') {
      setIsLoading(false);
      return;
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        // 1. Get workers managed by this manager
        const workersQuery = query(
          collection(firestore, 'workers'),
          where('managerId', '==', userProfile.id)
        );
        const workersSnapshot = await getDocs(workersQuery);
        const managedWorkers = workersSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...(doc.data() as Worker) })
        );
        const workerIds = managedWorkers.map((w) => w.id);
        const workerMap = new Map(managedWorkers.map(w => [w.id, w.name]));
        const totalWorkers = managedWorkers.length;

        // 2. Get attendance for today (with chunking)
        let presentWorkers = 0;
        if (workerIds.length > 0) {
            const attendanceChunks: DocumentData[] = [];
            for (let i = 0; i < workerIds.length; i += 30) {
                const chunk = workerIds.slice(i, i + 30);
                const attendanceQuery = query(
                    collection(firestore, 'attendance'),
                    where('workerId', 'in', chunk),
                    where('date', '==', todayStr)
                );
                const attendanceSnapshot = await getDocs(attendanceQuery);
                attendanceSnapshot.forEach(doc => attendanceChunks.push(doc.data()));
            }
            presentWorkers = attendanceChunks.length;
        }

        // 3. Get tasks
        const tasksQuery = query(
          collection(firestore, 'tasks'),
          where('managerId', '==', userProfile.id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const managedTasks = tasksSnapshot.docs.map(
          (doc) => doc.data() as FarmTask
        );
        
        const activeTasks = managedTasks.filter(
          (t) => t.status === 'Pending' || t.status === 'In Progress'
        ).length;
        const completedTasks = managedTasks.filter(
          (t) => t.status === 'Completed'
        ).length;

        const taskStatusCounts = managedTasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<FarmTask['status'], number>);
        setTaskStatusData(Object.entries(taskStatusCounts).map(([status, count]) => ({ name: status, value: count, fill: `var(--color-${status.replace(' ', '')})` })));
        
        // 4. Get Productivity (with chunking)
        let todaysOutput = 0;
        let productivityTotals: Record<string, number> = {};
        if (workerIds.length > 0) {
            for (let i = 0; i < workerIds.length; i += 30) {
                const chunk = workerIds.slice(i, i + 30);
                const productivityQuery = query(
                    collection(firestore, 'productivity'),
                    where('workerId', 'in', chunk),
                    where('date', '==', todayStr)
                );
                const productivitySnapshot = await getDocs(productivityQuery);
                productivitySnapshot.forEach(doc => {
                    const entry = doc.data() as ProductivityEntry;
                     if (entry.outputUnit.toLowerCase() === 'kg') {
                       todaysOutput += entry.outputQuantity;
                       const workerName = workerMap.get(entry.workerId) || 'Unknown';
                       productivityTotals[workerName] = (productivityTotals[workerName] || 0) + entry.outputQuantity;
                    }
                });
            }
        }
        setWorkerProductivity(Object.entries(productivityTotals).map(([name, output]) => ({ name, output })));

        setStats({
          presentWorkers,
          totalWorkers,
          absentWorkers: totalWorkers - presentWorkers,
          activeTasks,
          completedTasks,
          todaysOutput
        });

      } catch (error) {
        console.error('Error fetching manager dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userProfile, firestore]);
  
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Workers Present" value={String(stats.presentWorkers)} icon={UserCheck} description="Managed workers clocked in today" />
            <StatCard title="Workers Absent" value={String(stats.absentWorkers)} icon={UserX} description="Workers not clocked in today" />
            <StatCard title="Active Tasks" value={String(stats.activeTasks)} icon={ClipboardList} description="Tasks in progress or pending" />
            <StatCard title="Completed Tasks" value={String(stats.completedTasks)} icon={ClipboardCheck} description="Total tasks completed" />
            <StatCard title="Today's Output" value={`${stats.todaysOutput.toFixed(0)} kg`} icon={Tractor} description="Total output recorded today" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Daily Worker Productivity</CardTitle>
                    <CardDescription>Total output (kg) per worker for today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={productivityChartConfig} className="w-full h-[300px]">
                        <ResponsiveContainer>
                            <BarChart data={workerProductivity} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="output" fill="var(--color-output)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Task Status</CardTitle>
                    <CardDescription>Overview of all assigned tasks.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <ChartContainer config={taskChartConfig} className="mx-auto aspect-square h-[300px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={taskStatusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                    {taskStatusData.map((entry) => {
                                        const configColor = taskChartConfig[entry.name as keyof typeof taskChartConfig]?.color;
                                        return (
                                            <Cell key={`cell-${entry.name}`} fill={configColor || 'hsl(var(--muted))'} />
                                        )
                                    })}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="[&>*]:justify-center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
