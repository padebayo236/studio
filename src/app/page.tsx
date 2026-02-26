"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { StatCard } from "@/components/dashboard/stat-card"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { TasksTab } from "@/components/dashboard/tasks-tab"
import { WorkersTab } from "@/components/dashboard/workers-tab"
import {
  Users,
  Tractor,
  DollarSign,
  ClipboardCheck,
  Search,
  PanelLeft,
} from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { AgriProLogo } from "@/components/icons"
import { demoData } from "@/lib/demo-data"

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  const activeWorkers = demoData.workers.filter(w => w.status === 'Active').length;
  const totalTasks = demoData.tasks.length;
  const totalOutput = demoData.productivity.reduce((sum, p) => sum + p.outputQuantity, 0);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AgriProLogo className="h-6 w-6 text-primary" />
              <span className="">AgriPro Manager</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <MainNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <AgriProLogo className="h-6 w-6 text-primary" />
                  <span className="">AgriPro Manager</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <MainNav isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Workers"
              value={activeWorkers.toString()}
              icon={Users}
              description="Total active workers today"
            />
            <StatCard
              title="Total Output (kg)"
              value={totalOutput.toLocaleString()}
              icon={Tractor}
              description="This month's harvest"
            />
            <StatCard
              title="Pending Tasks"
              value={demoData.tasks.filter(t => t.status === 'Pending').length.toString()}
              icon={ClipboardCheck}
              description="Tasks to be started"
            />
            <StatCard
              title="Estimated Payroll"
              value={`$${(demoData.payroll.reduce((acc, p) => acc + p.totalPayment, 0) / 1000).toFixed(1)}k`}
              icon={DollarSign}
              description="This month's labor cost"
            />
          </div>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="workers">Workers</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="tasks">
              <TasksTab />
            </TabsContent>
            <TabsContent value="workers">
              <WorkersTab />
            </TabsContent>
            <TabsContent value="payroll">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll</CardTitle>
                  <CardDescription>
                    Monthly payroll summary. This feature is under development.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Payroll data will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>
                    Generate and download reports. This feature is under development.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Report generation options will be available here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
