
"use client"

import * as React from "react";
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, ClipboardCheck, Tractor, DollarSign, Award, BarChart, UserCheck } from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, where } from "firebase/firestore";
import { format } from "date-fns";

export function AdminDashboard() {
  const firestore = useFirestore();

  const workersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'farm_workers') : null),
    [firestore]
  );
  const { data: workersData } = useCollection(workersRef);

  const presentWorkersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(
        collectionGroup(firestore, 'attendance_records'),
        where('date', '==', todayStr),
        where('timeOut', '==', null)
    );
  }, [firestore]);
  const { data: presentWorkersData } = useCollection(presentWorkersQuery);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
       <StatCard
          title="Total Workers"
          value={workersData ? String(workersData.length) : "-"}
          icon={Users}
          description="All workers in the system"
        />
        <StatCard
          title="Workers Present"
          value={presentWorkersData ? String(presentWorkersData.length) : "-"}
          icon={UserCheck}
          description="Workers clocked in today"
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
