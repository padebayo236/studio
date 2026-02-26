"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Hourglass, Tractor, DollarSign, Check } from "lucide-react"

// Dummy data for now - this will be replaced with real data from Firestore
const todaysTasks = [
  { id: 'T004', name: 'Irrigation', field: 'North Field', status: 'In Progress' },
  { id: 'T005', name: 'Fertilizer Application', field: 'South Field', status: 'Pending' },
];

export function FarmWorkerDashboard() {
  const [isClockedIn, setIsClockedIn] = React.useState(false);

  const handleClockToggle = () => {
    setIsClockedIn(!isClockedIn);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Status</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <Button onClick={handleClockToggle} className="w-full">
                    {isClockedIn ? 'Clock Out' : 'Clock In'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    {isClockedIn ? "You are currently clocked in." : "You are currently clocked out."}
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
