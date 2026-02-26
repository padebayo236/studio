
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type {
  Worker,
  EmploymentType,
  WorkerStatus,
  FarmField,
} from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { collection, doc, query, where } from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const workerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().int().min(16, 'Worker must be at least 16 years old.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  address: z.string().min(5, 'Please enter a valid address.'),
  employmentType: z.enum(['Permanent', 'Seasonal', 'Daily Wage']),
  wageRate: z.coerce.number().min(0, 'Wage rate cannot be negative.'),
  assignedField: z.string().min(1, 'Please assign a field.'),
  status: z.enum(['Active', 'Inactive']),
  photoUrl: z
    .string()
    .url('Please enter a valid URL.')
    .optional()
    .or(z.literal('')),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

interface WorkerFormProps {
  worker?: Worker;
  onFormSubmit: () => void;
}

export function WorkerForm({ worker, onFormSubmit }: WorkerFormProps) {
  const firestore = useFirestore();
  const { userProfile } = useUserProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditing = !!worker;

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: isEditing
      ? {
          ...worker,
        }
      : {
          name: '',
          age: 18,
          gender: 'Male',
          phone: '',
          address: '',
          employmentType: 'Seasonal',
          wageRate: 15,
          assignedField: '',
          status: 'Active',
          photoUrl: '',
        },
  });

  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile) return null;

    if (userProfile.role === 'Admin') {
      return collection(firestore, 'farm_fields');
    }

    if (userProfile.role === 'FarmManager') {
      return query(
        collection(firestore, 'farm_fields'),
        where('managerId', '==', userProfile.id)
      );
    }

    return null;
  }, [firestore, userProfile]);
  const { data: fieldsData } = useCollection<FarmField>(fieldsQuery);

  const processSubmit = async (data: WorkerFormValues) => {
    if (!firestore || !userProfile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not available.',
      });
      return;
    }
    setIsLoading(true);

    const workersCollection = collection(firestore, 'farm_workers');
    const managerId = userProfile.id;

    try {
      if (isEditing) {
        const workerDoc = doc(workersCollection, worker.id);
        const updatedData = { ...data };
        updateDocumentNonBlocking(workerDoc, updatedData);
        toast({
          title: 'Success',
          description: 'Worker profile updated.',
        });
      } else {
        const newWorker: any = {
          ...data,
          managerId,
          createdAt: new Date().toISOString(),
          photoHint: 'worker portrait',
          photoUrl:
            data.photoUrl ||
            `https://picsum.photos/seed/${Math.random()}/100/100`,
        };
        addDocumentNonBlocking(workersCollection, newWorker);
        toast({
          title: 'Success',
          description: 'New worker created.',
        });
      }
      onFormSubmit();
    } catch (error) {
      console.error('Failed to save worker', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save worker profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="123-456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, Farmville" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                    <SelectItem value="Daily Wage">Daily Wage</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wageRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wage Rate ($/hr)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignedField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Field</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a field" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldsData?.map((f) => (
                      <SelectItem key={f.id} value={f.id!}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Worker Photo URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Worker'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
