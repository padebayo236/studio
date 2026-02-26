"use client"
import { StatCard } from "@/components/dashboard/stat-card"
import { FileText, Calculator, Banknote, Download } from "lucide-react"

export function AccountantDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
       <StatCard
          title="Attendance Data"
          value="View"
          icon={FileText}
          description="Access all worker attendance records"
        />
        <StatCard
          title="Calculate Wages"
          value="Run"
          icon={Calculator}
          description="Process wages based on hours and output"
        />
        <StatCard
          title="Generate Payroll"
          value="Create"
          icon={Banknote}
          description="Generate monthly payroll summaries"
        />
         <StatCard
          title="Export Reports"
          value="Download"
          icon={Download}
          description="Export salary and summary reports"
        />
    </div>
  )
}
