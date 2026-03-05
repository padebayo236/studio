'use client';
import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Worker, EmploymentType, WorkerStatus, FarmField } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { WorkerFormDialog } from '@/components/worker-form-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const statusVariant: { [key in WorkerStatus]: 'secondary' | 'outline' } = {
  Active: 'secondary',
  Inactive: 'outline',
};

export default function WorkersPage() {
  const { user, userProfile, isLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();
  const firestore = useFirestore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<{
    employmentType: EmploymentType | 'all';
    status: WorkerStatus | 'all';
  }>({
    employmentType: 'all',
    status: 'all',
  });

  const workersQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile) return null;
    if (userProfile.role === 'Admin' || userProfile.role === 'Accountant') {
        return collection(firestore, 'workers');
    }
    if (userProfile.role === 'FarmManager') {
        return query(collection(firestore, 'workers'), where('managerId', '==', userProfile.id));
    }
    return null;
  }, [firestore, userProfile]);

  const { data: workersData, isLoading: isWorkersLoading, error } = useCollection<Worker>(workersQuery);

  const fieldsRef = useMemoFirebase(() => firestore ? collection(firestore, 'fields') : null, [firestore]);
  const { data: fieldsData } = useCollection<FarmField>(fieldsRef);

  const fieldMap = React.useMemo(() => {
    if (!fieldsData) return new Map<string, string>();
    return new Map(fieldsData.map(f => [f.id, f.name]));
  }, [fieldsData]);

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router]);

  const handleDeactivate = (workerId: string) => {
    if (!firestore) return;
    const workerDocRef = doc(firestore, 'workers', workerId);
    updateDocumentNonBlocking(workerDocRef, { status: 'Inactive' });
  };
  
  const filteredWorkers = React.useMemo(() => {
    return (workersData || [])
      .filter((worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (worker) =>
          filters.employmentType === 'all' ||
          worker.employmentType === filters.employmentType
      )
      .filter(
        (worker) => filters.status === 'all' || worker.status === filters.status
      );
  }, [workersData, searchTerm, filters]);


  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!userProfile || !['Admin', 'FarmManager', 'Accountant'].includes(userProfile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please contact an administrator if you believe this is an error.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Worker Management</CardTitle>
          <CardDescription>
            Add, view, and manage all farm workers.
          </CardDescription>
        </div>
        {(userProfile.role === 'Admin' || userProfile.role === 'FarmManager') && (
            <WorkerFormDialog>
                <Button>
                <UserPlus className="mr-2" />
                Add Worker
                </Button>
            </WorkerFormDialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={filters.employmentType}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                employmentType: value as EmploymentType | 'all',
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Permanent">Permanent</SelectItem>
              <SelectItem value="Seasonal">Seasonal</SelectItem>
              <SelectItem value="Daily Wage">Daily Wage</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value as WorkerStatus | 'all',
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Employment Type
              </TableHead>
              <TableHead className="hidden md:table-cell">Assigned Field</TableHead>
              <TableHead className="hidden md:table-cell">
                Wage Rate
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isWorkersLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : error ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-red-500">
                        Error loading workers: {error.message}
                    </TableCell>
                </TableRow>
            ) : filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Worker photo"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={worker.photoUrl || 'https://picsum.photos/seed/placeholder/64/64'}
                      width="64"
                      data-ai-hint={worker.photoHint || 'worker portrait'}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {worker.name}
                    <div className="text-sm text-muted-foreground">
                      {worker.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[worker.status]}>
                      {worker.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {worker.employmentType}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{fieldMap.get(worker.assignedField) || 'N/A'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    ${worker.wageRate.toFixed(2)}/hr
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <WorkerFormDialog workerToEdit={worker}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Edit
                            </DropdownMenuItem>
                        </WorkerFormDialog>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeactivate(worker.id!)}
                          className="text-red-500"
                          disabled={worker.status === 'Inactive'}
                        >
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No workers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
