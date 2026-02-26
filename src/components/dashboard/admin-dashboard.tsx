'use client';

import * as React from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Users,
  ClipboardCheck,
  Tractor,
  DollarSign,
  Award,
  UserCheck,
  Wheat,
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query, where } from 'firebase/firestore';
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
} from '@/lib/types';

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
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

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

  // --- DATA FETCHING ---
  const workersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'farm_workers') : null),
    [firestore]
  );
  const { data: workersData } = useCollection<Worker>(workersRef);

  const fieldsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'farm_fields') : null),
    [firestore]
  );
  const { data: fieldsData } = useCollection<FarmField>(fieldsRef);
  const fieldMap = React.useMemo(
    () => new Map(fieldsData?.map((f) => [f.id, f])),
    [fieldsData]
  );

  const tasksRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'farm_tasks') : null),
    [firestore]
  );
  const { data: tasksData } = useCollection<FarmTask>(tasksRef);

  const productivityRef = useMemoFirebase(
    () => (firestore ? collectionGroup(firestore, 'productivity_entries') : null),
    [firestore]
  );
  const { data: productivityData } = useCollection<ProductivityEntry>(
    productivityRef
  );

  const presentWorkersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(
      collectionGroup(firestore, 'attendance_records'),
      where('date', '==', todayStr)
    );
  }, [firestore]);
  const { data: presentWorkersData } = useCollection(presentWorkersQuery);

  const payrollQuery = useMemoFirebase(
    () => (firestore ? collectionGroup(firestore, 'payroll_summaries') : null),
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
    
    // Aggregate output by month
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

    // Generate date range for the last 12 months
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
          <CardContent className="pt-6">
            <ChartContainer config={productivityChartConfig} className="w-full h-[300px]">
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
          <CardContent className="pt-6">
            <ChartContainer config={monthlyOutputChartConfig} className="w-full h-[300px]">
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
            </ChartContainer>
          </CardContent>
        </Card>
    </div>
  );
}
