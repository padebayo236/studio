
'use client';

import * as React from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Users,
  ClipboardCheck,
  DollarSign,
  Award,
  UserCheck,
  Wheat,
  DatabaseZap,
  Loader2,
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from 'date-fns';
import type {
  PayrollSummary,
  Worker,
  FarmTask,
  ProductivityEntry,
  FarmField,
  MonthlyOutputDataPoint,
  UserProfile,
} from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '@/components/ui/button';

const laborChartConfig = {
  Maize: { label: 'Maize', color: 'hsl(var(--chart-1))' },
  Rice: { label: 'Rice', color: 'hsl(var(--chart-2))' },
  Tomato: { label: 'Tomato', color: 'hsl(var(--chart-3))' },
  Cassava: { label: 'Cassava', color: 'hsl(var(--chart-4))' },
  Other: { label: 'Other', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;

const productivityChartConfig = {
  output: {
    label: "Output",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const monthlyOutputChartConfig = {
  output: {
    label: "Output",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AdminDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [migrationLog, setMigrationLog] = React.useState<string[]>([]);
  const [isMigrating, setIsMigrating] = React.useState(false);

  // --- DATA FETCHING ---
  const workersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workersData } = useCollection<Worker>(workersRef);

  const fieldsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'fields') : null),
    [firestore]
  );
  const { data: fieldsData } = useCollection<FarmField>(fieldsRef);
  const fieldMap = React.useMemo(
    () => new Map(fieldsData?.map((f) => [f.id, f])),
    [fieldsData]
  );

  const tasksRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'tasks') : null),
    [firestore]
  );
  const { data: tasksData } = useCollection<FarmTask>(tasksRef);

  const productivityRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'productivity') : null),
    [firestore]
  );
  const { data: productivityData } = useCollection<ProductivityEntry>(
    productivityRef
  );

  const presentWorkersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(
      collection(firestore, 'attendance'),
      where('date', '==', todayStr)
    );
  }, [firestore]);
  const { data: presentWorkersData } = useCollection(presentWorkersQuery);

  const payrollQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'payroll') : null),
    [firestore]
  );
  const { data: payrollsData } = useCollection<PayrollSummary>(payrollQuery);

  // --- KPI CALCULATIONS ---
  const totalLaborCost = React.useMemo(() => {
    if (!payrollsData) return '-';
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const cost = payrollsData
      .filter((p) => p.month === currentMonth && p.year === currentYear)
      .reduce((sum, p) => sum + p.totalPaymentDue, 0);
    return `$${cost.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [payrollsData]);

  const activeTasksCount = React.useMemo(() => {
    if (!tasksData) return '-';
    return tasksData.filter(
      (t) => t.status === 'Pending' || t.status === 'In Progress'
    ).length;
  }, [tasksData]);

  const totalOutput = React.useMemo(() => {
    if (!productivityData) return '-';
    const total = productivityData.reduce((sum, p) => sum + p.outputQuantity, 0);
    // Simple unit aggregation, a real app would need to handle mixed units
    const unit = productivityData[0]?.outputUnit || '';
    return `${total.toLocaleString()} ${unit}`;
  }, [productivityData]);

  const productivityByWorker = React.useMemo(() => {
    if (!productivityData || !workersData) return [];
    const workerMap = new Map(workersData.map((w) => [w.id, w.name]));
    const workerTotals = productivityData.reduce((acc, entry) => {
      const name = workerMap.get(entry.workerId) || 'Unknown';
      if (!acc[name]) acc[name] = 0;
      // Simplification: assumes a consistent unit like 'kg'
      if (entry.outputUnit.toLowerCase().includes('kg')) {
        acc[name] += entry.outputQuantity;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(workerTotals)
      .map(([worker, output]) => ({ worker, output }))
      .sort((a, b) => b.output - a.output)
      .slice(0, 10);
  }, [productivityData, workersData]);

  const mostProductiveWorker = productivityByWorker[0]?.worker || '-';

  const laborDistribution = React.useMemo(() => {
    if (!workersData || !fieldMap.size) return [];

    const cropCounts = workersData.reduce((acc, worker) => {
      const field = fieldMap.get(worker.assignedField);
      if (field) {
        const crop = field.cropType as keyof typeof laborChartConfig;
        if (laborChartConfig[crop]) {
          if (!acc[crop]) acc[crop] = 0;
          acc[crop]++;
        } else {
          if (!acc['Other']) acc['Other'] = 0;
          acc['Other']++;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cropCounts).map(([crop, workers]) => ({
      crop,
      workers,
    }));
  }, [workersData, fieldMap]);
  
  const monthlyOutput = React.useMemo((): MonthlyOutputDataPoint[] => {
    if (!productivityData) return [];
    
    const monthlyTotals = productivityData.reduce((acc, entry) => {
        const monthKey = format(new Date(entry.date), 'yyyy-MM');
        if (!acc[monthKey]) {
            acc[monthKey] = 0;
        }
        if (entry.outputUnit.toLowerCase().includes('kg')) {
            acc[monthKey] += entry.outputQuantity;
        }
        return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    const last12MonthsInterval = {
        start: startOfMonth(new Date(new Date().setMonth(today.getMonth() - 11))),
        end: endOfMonth(today)
    };

    return eachMonthOfInterval(last12MonthsInterval).map(monthDate => {
        const monthKey = format(monthDate, 'yyyy-MM');
        return {
            month: format(monthDate, 'MMM'),
            output: monthlyTotals[monthKey] || 0
        };
    });
}, [productivityData]);

const handleMigration = async () => {
  if (!firestore) {
    toast({
      title: 'Firestore not available',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    return;
  }

  setIsMigrating(true);
  setMigrationLog(['Starting worker data synchronization...']);
  const startTime = Date.now();

  try {
    const usersRef = collection(firestore, 'users');
    const workersRef = collection(firestore, 'workers');
    let usersFixed = 0;
    let workersFixed = 0;
    
    let batch = writeBatch(firestore);
    let writeCount = 0;

    const commitBatchIfNeeded = async () => {
      if (writeCount >= 400) {
        await batch.commit();
        batch = writeBatch(firestore);
        writeCount = 0;
      }
    };

    setMigrationLog(log => [...log, '[1/2] Checking `users` for FarmWorkers missing a `workers` profile...']);
    const farmWorkerUsersQuery = query(usersRef, where('role', '==', 'FarmWorker'));
    const farmWorkerUsersSnapshot = await getDocs(farmWorkerUsersQuery);
    
    for (const userDoc of farmWorkerUsersSnapshot.docs) {
      const user = userDoc.data() as UserProfile;
      const workerDocRef = doc(workersRef, user.id);
      const workerDocSnap = await getDoc(workerDocRef);

      if (!workerDocSnap.exists()) {
        setMigrationLog(log => [...log, `  - FIXING: User ${user.name} (${user.id}) needs a worker profile.`]);
        const newWorkerProfile: Omit<Worker, 'id'> = {
          userId: user.id,
          name: user.name,
          phone: user.phoneNumber || '',
          employmentType: 'Not Assigned',
          age: 18,
          gender: 'Other',
          address: '',
          assignedField: '',
          wageRate: 0,
          status: 'Active',
          managerId: '',
          photoUrl: `https://picsum.photos/seed/${user.id}/100/100`,
          photoHint: 'worker portrait',
          createdAt: user.createdAt,
        };
        batch.set(workerDocRef, newWorkerProfile);
        workersFixed++;
        writeCount++;
        await commitBatchIfNeeded();
      }
    }
    setMigrationLog(log => [...log, `[1/2] Complete. Found ${workersFixed} missing worker profiles to create.`]);

    setMigrationLog(log => [...log, '[2/2] Checking `workers` for profiles missing a `users` profile...']);
    const allWorkersSnapshot = await getDocs(workersRef);
    for (const workerDoc of allWorkersSnapshot.docs) {
      const worker = { id: workerDoc.id, ...workerDoc.data() } as Worker;
      const userDocRef = doc(usersRef, worker.id);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        setMigrationLog(log => [...log, `  - FIXING: Worker ${worker.name} (${worker.id}) needs a user profile.`]);
        const newUserProfile: UserProfile = {
          id: worker.id,
          name: worker.name,
          email: '', // Legacy worker has no email/auth
          role: 'FarmWorker',
          status: 'active',
          phoneNumber: worker.phone || '',
          createdAt: worker.createdAt,
        };
        batch.set(userDocRef, newUserProfile);
        usersFixed++;
        writeCount++;
        await commitBatchIfNeeded();
      }
    }
    setMigrationLog(log => [...log, `[2/2] Complete. Found ${usersFixed} missing user profiles to create.`]);
    
    if (writeCount > 0) {
      await batch.commit();
    }

    const duration = (Date.now() - startTime) / 1000;
    setMigrationLog(log => [...log, `--- MIGRATION COMPLETE in ${duration.toFixed(2)}s ---`]);
    setMigrationLog(log => [...log, `Summary: ${workersFixed} worker profiles created, ${usersFixed} user profiles created.`]);

    toast({
      title: 'Migration Complete',
      description: 'Worker data has been synchronized.',
    });

  } catch (e: any) {
    setMigrationLog(log => [...log, `ERROR: ${e.message}`]);
    toast({
      title: 'Migration Failed',
      description: e.message,
      variant: 'destructive',
    });
  } finally {
    setIsMigrating(false);
  }
};


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Total Workers"
          value={workersData ? String(workersData.length) : '-'}
          icon={Users}
          description="All workers in the system"
        />
        <StatCard
          title="Workers Present"
          value={presentWorkersData ? String(presentWorkersData.length) : '-'}
          icon={UserCheck}
          description="Workers clocked in today"
        />
        <StatCard
          title="Active Tasks"
          value={String(activeTasksCount)}
          icon={ClipboardCheck}
          description="Tasks in progress or pending"
        />
        <StatCard
          title="Total Output"
          value={String(totalOutput)}
          icon={Wheat}
          description="All-time recorded output (kg)"
        />
        <StatCard
          title="Total Labor Cost"
          value={totalLaborCost}
          icon={DollarSign}
          description="This month's payroll"
        />
        <StatCard
          title="Top Performer"
          value={mostProductiveWorker}
          icon={Award}
          description="Based on all-time output"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Worker Productivity</CardTitle>
            <CardDescription>
              Top 10 workers by total output (kg, all time).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={productivityChartConfig} className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={productivityByWorker}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="worker"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        />
                        <YAxis />
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar
                        dataKey="output"
                        fill="var(--color-output)"
                        radius={4}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Labor Distribution</CardTitle>
            <CardDescription>
              Number of workers assigned per primary crop type.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-6">
            <ChartContainer config={laborChartConfig} className="mx-auto aspect-square h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                        data={laborDistribution}
                        dataKey="workers"
                        nameKey="crop"
                        innerRadius={60}
                        strokeWidth={5}
                        >
                        {laborDistribution.map((entry) => (
                            <Cell
                            key={`cell-${entry.crop}`}
                            fill={
                                laborChartConfig[
                                entry.crop as keyof typeof laborChartConfig
                                ]?.color || laborChartConfig['Other'].color
                            }
                            />
                        ))}
                        </Pie>
                        <ChartLegend
                        content={<ChartLegendContent nameKey="crop" />}
                        className="[&>*]:justify-center"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
          <CardHeader>
            <CardTitle>Monthly Output Trend</CardTitle>
            <CardDescription>
              Total output (kg) over the last 12 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyOutputChartConfig} className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={monthlyOutput}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Line
                    dataKey="output"
                    type="monotone"
                    stroke="var(--color-output)"
                    strokeWidth={2}
                    dot={{
                        fill: "var(--color-output)",
                    }}
                    activeDot={{
                        r: 6,
                    }}
                    />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><DatabaseZap /> One-Time Data Migration</CardTitle>
                <CardDescription>
                Run this script to synchronize legacy `users` and `workers` data. This should only be run once.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleMigration} disabled={isMigrating}>
                {isMigrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run Worker Sync
                </Button>
            </CardContent>
            {migrationLog.length > 0 && (
                <CardFooter>
                <div className="w-full space-y-2">
                    <p className="font-semibold text-sm">Migration Log:</p>
                    <div className="w-full h-40 overflow-y-auto bg-muted p-3 rounded-md border text-xs font-mono">
                    {migrationLog.map((log, index) => (
                        <p key={index}>{log}</p>
                    ))}
                    </div>
                </div>
                </CardFooter>
            )}
            </Card>
        </div>
    </div>
  );
}
