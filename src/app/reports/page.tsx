
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { ProductivityEntry, Worker, FarmField, FarmTask } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  AlertTriangle,
  FileText,
  Download,
  Sparkles
} from 'lucide-react';
import { DateRangePicker } from '@/components/date-range-picker';
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
} from "@/components/ui/alert-dialog";
import type { DateRange } from 'react-day-picker';

export default function ReportsPage() {
    const { userProfile, isLoading: isAuthLoading } = useUserProfile();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [reportType, setReportType] = React.useState('monthlyProductivity');
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(false);
    const [reportData, setReportData] = React.useState<any>(null);
    const [aiInsights, setAiInsights] = React.useState<any>(null);
    const [isGeneratingInsights, setIsGeneratingInsights] = React.useState(false);
    const [showInsightsDialog, setShowInsightsDialog] = React.useState(false);

    if (isAuthLoading) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }

    if (!userProfile || !['Admin', 'FarmManager', 'Accountant'].includes(userProfile.role)) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive" /> Access Denied
                </CardTitle>
                <CardDescription>You do not have permission to view this page.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Please contact an administrator if you believe this is an error.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go to Dashboard</Button>
              </CardContent>
            </Card>
          </div>
        );
    }

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReportData(null);
        // In a real implementation, this would fetch and process data based on reportType and filters
        console.log('Generating report for:', { reportType, dateRange });
        
        // Placeholder for report generation logic
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setReportData({
            title: 'Monthly Labor Productivity Report',
            summary: 'This is a sample report showing worker productivity for the selected period.',
            // ... more structured data
        });
        
        setIsLoading(false);
    }
    
    const handleGenerateInsights = async () => {
        if (!firestore) return;
        setIsGeneratingInsights(true);

        try {
            const productivityQuery = query(collection(firestore, 'productivity'));
            const querySnapshot = await getDocs(productivityQuery);
            const entries = querySnapshot.docs.map(doc => doc.data());
            
            if (entries.length === 0) {
              toast({ variant: 'destructive', title: 'No Data', description: 'Cannot generate insights without productivity data.' });
              setIsGeneratingInsights(false);
              return;
            }

            const reportContent = entries.map(e => 
              `Entry: WorkerID ${e.workerId} worked ${e.hoursWorkedForEntry} hours on task ${e.taskId} and produced ${e.outputQuantity} ${e.outputUnit}.`
            ).join('\n');
            
            const result = await generateProductivityInsightsAction({ reportContent });
            setAiInsights(result);
            setShowInsightsDialog(true);
        } catch (error) {
            toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to generate insights.' });
        } finally {
            setIsGeneratingInsights(false);
        }
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Farm Reports</CardTitle>
                    <CardDescription>Select a report type and date range to analyze your farm's performance.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a report type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthlyProductivity">Monthly Labor Productivity</SelectItem>
                            <SelectItem value="fieldPerformance">Field Performance</SelectItem>
                            <SelectItem value="workerEfficiency">Worker Efficiency Ranking</SelectItem>
                            <SelectItem value="costVsOutput">Labor Cost vs. Output</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />

                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        Generate Report
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}
            
            {reportData && !isLoading && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{reportData.title}</CardTitle>
                            <CardDescription>{reportData.summary}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={handleGenerateInsights} disabled={isGeneratingInsights} variant="outline">
                                {isGeneratingInsights ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {isGeneratingInsights ? 'Analyzing...' : 'Get AI Insights'}
                            </Button>
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 border rounded-lg bg-muted/50 text-center">
                            <p className="text-muted-foreground">Report content will be displayed here.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!reportData && !isLoading && (
                 <Card className="flex flex-col items-center justify-center p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle>No Report Generated</CardTitle>
                    <CardDescription className="mt-2">
                       Select your desired report and filters, then click "Generate Report".
                    </CardDescription>
                </Card>
            )}
            
             {aiInsights && (
                 <AlertDialog open={showInsightsDialog} onOpenChange={setShowInsightsDialog}>
                    <AlertDialogContent className="max-w-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> AI-Powered Report Insights</AlertDialogTitle>
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
