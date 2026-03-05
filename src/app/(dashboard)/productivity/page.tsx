
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import {
  useProductivity,
  useWorkers,
  useFields,
  useTasks,
} from '@/hooks/data/use-operational-data';
import type { ProductivityEntry } from '@/lib/types';
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
import {
  Loader2,
  AlertTriangle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { ProductivityFormDialog } from '@/components/productivity-form-dialog';
import { format, parseISO } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { generateProductivityInsightsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const chartConfig = {
  output: {
    label: "Output (kg)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ProductivityPage() {
  const { userProfile, isLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();
  const { toast } = useToast();

  const [aiInsights, setAiInsights] = React.useState<any>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showInsightsDialog, setShowInsightsDialog] = React.useState(false);
  
  const { data: entries, isLoading: isEntriesLoading, error } = useProductivity();
  const { data: allWorkers, isLoading: isWorkersLoading } = useWorkers();
  const { data: fieldsData } = useFields();
  const { data: tasksData } = useTasks();

  const workerMap = React.useMemo(() => new Map(allWorkers?.map(w => [w.id, w.name])), [allWorkers]);
  const fieldMap = React.useMemo(() => new Map(fieldsData?.map(f => [f.id, f.name])), [fieldsData]);
  const taskMap = React.useMemo(() => new Map(tasksData?.map(t => [t.id, `${t.taskType} - ${t.cropType}`])), [tasksData]);

  const handleGenerateInsights = async () => {
    if (!entries || entries.length === 0) {
      toast({ variant: 'destructive', title: 'No Data', description: 'Cannot generate insights without productivity data.' });
      return;
    }
    setIsGenerating(true);
    const reportContent = entries.map(e => 
      `On ${e.date}, worker ${workerMap.get(e.workerId) || e.workerId} worked ${e.hoursWorkedForEntry} hours on task ${taskMap.get(e.taskId) || e.taskId} in field ${fieldMap.get(e.fieldId) || e.fieldId} and produced ${e.outputQuantity} ${e.outputUnit}.`
    ).join('\n');
    
    try {
      const result = await generateProductivityInsightsAction({ reportContent });
      setAiInsights(result);
      setShowInsightsDialog(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to generate insights.' });
    } finally {
      setIsGenerating(false);
    }
  }

  const productivityByWorker = React.useMemo(() => {
    if (!entries || !workerMap.size) return [];
    const workerTotals = entries.reduce((acc, entry) => {
        const name = workerMap.get(entry.workerId) || 'Unknown';
        if (!acc[name]) {
            acc[name] = { totalOutput: 0, count: 0 };
        }
        if (entry.outputUnit === 'kg') {
            acc[name].totalOutput += entry.outputQuantity;
        }
        return acc;
    }, {} as Record<string, {totalOutput: number, count: number}>);
    
    return Object.entries(workerTotals).map(([worker, data]) => ({ worker, output: data.totalOutput })).sort((a,b) => b.output - a.output);
  }, [entries, workerMap]);

  if (isAuthLoading || isWorkersLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!userProfile || !['Admin', 'FarmManager', 'Accountant'].includes(userProfile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-1/2"><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Access Denied</CardTitle><CardDescription>You do not have permission to view this page.</CardDescription></CardHeader><CardContent><p>Please contact an administrator if you believe this is an error.</p><Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Worker Output (kg)</CardTitle>
                    <CardDescription>Total output per worker.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer>
                      <BarChart data={productivityByWorker} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="worker" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="output" fill="var(--color-output)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Productivity Insights</CardTitle>
                    <CardDescription>Use AI to analyze the productivity data and generate actionable insights.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full gap-4">
                     <Button onClick={handleGenerateInsights} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isGenerating ? 'Analyzing Data...' : 'Generate AI Insights'}
                    </Button>
                    <p className="text-xs text-muted-foreground">Analyzes the raw data from the table below.</p>
                </CardContent>
            </Card>
        </div>


      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Productivity Log</CardTitle>
            <CardDescription>All recorded productivity entries from workers.</CardDescription>
          </div>
          {(userProfile.role === 'Admin' || userProfile.role === 'FarmManager') && (
            <ProductivityFormDialog>
                <Button>
                <PlusCircle className="mr-2" /> Log Entry
                </Button>
            </ProductivityFormDialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Worker</TableHead><TableHead>Task</TableHead><TableHead>Field</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Output</TableHead><TableHead className="text-right">Hours</TableHead></TableRow></TableHeader>
            <TableBody>
              {isEntriesLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-destructive">Error: {error.message}</TableCell></TableRow>
              ) : entries?.length > 0 ? (
                entries?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{workerMap.get(entry.workerId) || 'Unknown Worker'}</TableCell>
                    <TableCell>{taskMap.get(entry.taskId) || 'Unknown Task'}</TableCell>
                    <TableCell>{fieldMap.get(entry.fieldId) || 'Unknown Field'}</TableCell>
                    <TableCell>{format(parseISO(entry.date), 'PP')}</TableCell>
                    <TableCell className="text-right">{entry.outputQuantity} {entry.outputUnit}</TableCell>
                    <TableCell className="text-right">{entry.hoursWorkedForEntry.toFixed(1)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No productivity entries found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {aiInsights && (
         <AlertDialog open={showInsightsDialog} onOpenChange={setShowInsightsDialog}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> AI Productivity Insights</AlertDialogTitle>
                    <AlertDialogDescription>{aiInsights.summary}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold mb-2">Top Performers</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {aiInsights.topPerformers.map((item: string, index: number) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {aiInsights.areasForImprovement.map((item: string, index: number) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Unusual Trends</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {aiInsights.unusualTrends.map((item: string, index: number) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Actionable Insights</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {aiInsights.actionableInsights.map((item: string, index: number) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction>Got it</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      )}

    </div>
  );
}
