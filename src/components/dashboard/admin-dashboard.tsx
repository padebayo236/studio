"use client"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, ClipboardCheck, Tractor, DollarSign, Award, BarChart } from "lucide-react"

export function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
       <StatCard
          title="Total Workers"
          value={"-"}
          icon={Users}
          description="All workers in the system"
        />
        <StatCard
          title="Active Tasks"
          value={"-"}
          icon={ClipboardCheck}
          description="Tasks currently in progress or pending"
        />
        <StatCard
          title="Total Output"
          value={"-"}
          icon={Tractor}
          description="This month's total output"
        />
         <StatCard
          title="Total Labor Cost"
          value={"-"}
          icon={DollarSign}
          description="This month's payroll"
        />
        <StatCard
          title="Most Productive Worker"
          value={"-"}
          icon={Award}
          description="Top performer this month"
        />
        <StatCard
          title="Field Performance"
          value={"-"}
          icon={BarChart}
          description="Comparison of field outputs"
        />
    </div>
  )
}
