
'use client';
import * as React from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Users,
  ClipboardList,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { format } from 'date-fns';
import type { FarmTask, Worker } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function FarmManagerDashboard() {
  const { userProfile } = useUserProfile();
  const firestore = useFirestore();
  const [stats, setStats] = React.useState({
    presentWorkers: '-',
    totalWorkers: '-',
    activeTasks: '-',
    overdueTasks: '-',
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userProfile || !firestore || userProfile.role !== 'FarmManager') {
      setIsLoading(false);
      return;
    };

    const fetchManagerData = async () => {
      setIsLoading(true);
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        // 1. Get workers managed by this manager
        const workersQuery = query(
          collection(firestore, 'workers'),
          where('managerId', '==', userProfile.id)
        );
        const workersSnapshot = await getDocs(workersQuery);
        const managedWorkers = workersSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...(doc.data() as Worker) })
        );
        const workerIds = managedWorkers.map((w) => w.id);
        const totalWorkers = managedWorkers.length;

        let presentWorkers = 0;
        if (workerIds.length > 0) {
          // Firestore 'in' query is limited to 30 items. This is a limitation for now.
          const chunks = [];
          for (let i = 0; i < workerIds.length; i += 30) {
            chunks.push(workerIds.slice(i, i + 30));
          }
          
          let presentCount = 0;
          for (const chunk of chunks) {
            const attendanceQuery = query(
              collection(firestore, 'attendance'),
              where('workerId', 'in', chunk),
              where('date', '==', todayStr)
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);
            presentCount += attendanceSnapshot.size;
          }
          presentWorkers = presentCount;
        }

        // 2. Get tasks managed by this manager
        const tasksQuery = query(
          collection(firestore, 'tasks'),
          where('managerId', '==', userProfile.id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const managedTasks = tasksSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...(doc.data() as FarmTask) })
        );

        const activeTasks = managedTasks.filter(
          (t) => t.status === 'Pending' || t.status === 'In Progress'
        ).length;
        const overdueTasks = managedTasks.filter(
          (t) => t.status !== 'Completed' && new Date(t.deadline) < new Date()
        ).length;

        setStats({
          presentWorkers: String(presentWorkers),
          totalWorkers: String(totalWorkers),
          activeTasks: String(activeTasks),
          overdueTasks: String(overdueTasks),
        });
      } catch (error) {
        console.error('Error fetching manager dashboard data:', error);
        setStats({
          presentWorkers: 'Error',
          totalWorkers: 'Error',
          activeTasks: 'Error',
          overdueTasks: 'Error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagerData();
  }, [userProfile, firestore]);
  
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="My Workers"
        value={stats.totalWorkers}
        icon={Users}
        description="Total workers you manage"
      />
      <StatCard
        title="Workers Present"
        value={stats.presentWorkers}
        icon={UserCheck}
        description="Managed workers clocked in today"
      />
      <StatCard
        title="Active Tasks"
        value={stats.activeTasks}
        icon={ClipboardList}
        description="Your assigned tasks in progress"
      />
      <StatCard
        title="Overdue Tasks"
        value={stats.overdueTasks}
        icon={AlertTriangle}
        description="Tasks that are past their deadline"
      />
    </div>
  );
}
