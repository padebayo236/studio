
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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import type { FarmTask, Worker, ProductivityEntry, AttendanceRecord } from '@/lib/types';
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
  
  // --- DATA FETCHING (mirroring Admin Dashboard's scope) ---
  const workersRef = useMemoFirebase(() => firestore ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workersData, isLoading: isWorkersLoading } = useCollection<Worker>(workersRef);

  const tasksRef = useMemoFirebase(() => firestore ? collection(firestore, 'tasks') : null, [firestore]);
  const { data: tasksData, isLoading: isTasksLoading } = useCollection<FarmTask>(tasksRef);
  
  const todaysProductivityQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(collection(firestore, 'productivity'), where('date', '==', todayStr));
  }, [firestore]);
  const { data: todaysProductivity, isLoading: isProductivityLoading } = useCollection<ProductivityEntry>(todaysProductivityQuery);

  const todaysAttendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(collection(firestore, 'attendance'), where('date', '==', todayStr));
  }, [firestore]);
  const { data: todaysAttendance, isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(todaysAttendanceQuery);

  // --- KPI & CHART CALCULATIONS ---
  const isLoading = isWorkersLoading || isTasksLoading || isProductivityLoading || isAttendanceLoading;

  const stats = React.useMemo(() => {
    const totalWorkers = workersData?.length ?? 0;
    const presentWorkers = todaysAttendance?.length ?? 0;
    const absentWorkers = totalWorkers > 0 ? totalWorkers - presentWorkers : 0;
    const activeTasks = tasksData?.filter(t => t.status === 'Pending' || t.status === 'In Progress').length ?? 0;
    const completedTasks = tasksData?.filter(t => t.status === 'Completed').length ?? 0;
    const todaysOutput = todaysProductivity?.reduce((acc, entry) => {
        // Simple unit check, a real app might need conversion
        if (entry.outputUnit.toLowerCase() === 'kg') {
           return acc + (entry.outputQuantity || 0);
        }
        return acc;
    }, 0) ?? 0;

    return {
      presentWorkers,
      totalWorkers,
      absentWorkers,
      activeTasks,
      completedTasks,
      todaysOutput
    };
  }, [workersData, tasksData, todaysProductivity, todaysAttendance]);


  const taskStatusData = React.useMemo(() => {
    if (!tasksData) return [];
    const statusCounts = tasksData.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {} as Record<FarmTask['status'], number>);
    return Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));
  }, [tasksData]);

  const workerProductivity = React.useMemo(() => {
    if (!todaysProductivity || !workersData) return [];
    const workerMap = new Map(workersData.map(w => [w.id, w.name]));
    const productivityTotals: Record<string, number> = {};

    todaysProductivity.forEach(entry => {
        if (entry.outputUnit.toLowerCase() === 'kg') {
            const workerName = workerMap.get(entry.workerId) || 'Unknown Worker';
            productivityTotals[workerName] = (productivityTotals[workerName] || 0) + entry.outputQuantity;
        }
    });
    return Object.entries(productivityTotals).map(([name, output]) => ({ name, output })).sort((a,b) => b.output - a.output);
  }, [todaysProductivity, workersData]);
  
  
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
            <StatCard title="Workers Present" value={String(stats.presentWorkers)} icon={UserCheck} description="Workers clocked in today" />
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
