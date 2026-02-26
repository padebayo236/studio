"use client"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, ClipboardList, Tractor, UserCheck, AlertTriangle } from "lucide-react"

export function FarmManagerDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
       <StatCard
          title="Workers Present"
          value={"-"}
          icon={UserCheck}
          description="Workers clocked in today"
        />
        <StatCard
          title="Tasks Assigned Today"
          value={"-"}
          icon={ClipboardList}
          description="New and ongoing tasks for today"
        />
        <StatCard
          title="Output per Field"
          value={"-"}
          icon={Tractor}
          description="Live output from fields"
        />
         <StatCard
          title="Worker Productivity"
          value={"-"}
          icon={Users}
          description="Individual worker performance"
        />
        <StatCard
          title="Task Alerts"
          value={"-"}
          icon={AlertTriangle}
          description="Incomplete or overdue tasks"
        />
    </div>
  )
}
