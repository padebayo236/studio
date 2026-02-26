
"use client"
import * as React from "react";
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, ClipboardList, Tractor, UserCheck, AlertTriangle } from "lucide-react"
import { useUserProfile } from "@/hooks/use-user-profile";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, collectionGroup } from "firebase/firestore";
import { format } from "date-fns";

export function FarmManagerDashboard() {
  const { userProfile } = useUserProfile();
  const firestore = useFirestore();
  const [presentWorkers, setPresentWorkers] = React.useState<number | string>("-");

  React.useEffect(() => {
    if (!userProfile || !firestore || userProfile.role !== 'FarmManager') return;

    const fetchPresentWorkers = async () => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      // 1. Get workers managed by this manager
      const workersQuery = query(collection(firestore, 'farm_workers'), where('managerId', '==', userProfile.id));
      const workersSnapshot = await getDocs(workersQuery);
      const workerIds = workersSnapshot.docs.map(doc => doc.id);

      if (workerIds.length === 0) {
        setPresentWorkers(0);
        return;
      }
      
      // 2. Find which of them have an active attendance record for today
      // Firestore 'in' query is limited to 30 items. This is a limitation for now.
      const attendanceQuery = query(
        collectionGroup(firestore, 'attendance_records'),
        where('workerId', 'in', workerIds.slice(0, 30)),
        where('date', '==', todayStr),
        where('timeOut', '==', null)
      );

      try {
        const attendanceSnapshot = await getDocs(attendanceQuery);
        setPresentWorkers(attendanceSnapshot.size);
      } catch (error) {
        console.error("Error fetching present workers:", error);
        setPresentWorkers("Error");
      }
    };

    fetchPresentWorkers();
  }, [userProfile, firestore]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
       <StatCard
          title="Workers Present"
          value={String(presentWorkers)}
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
