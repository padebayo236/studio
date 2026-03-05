
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
  FarmField,
  UserProfile,
} from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';
import { useUserProfile } from '@/hooks/use-user-profile';
import { collection, doc, query, where, writeBatch } from 'firebase/firestore';
import {
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const workerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters.').optional(),
  age: z.coerce.number().int().min(16, 'Worker must be at least 16 years old.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  address: z.string().min(5, 'Please enter a valid address.'),
  employmentType: z.enum(['Permanent', 'Seasonal', 'Daily Wage', 'Not Assigned']),
  wageRate: z.coerce.number().min(0, 'Wage rate cannot be negative.'),
  assignedField: z.string().min(1, 'Please assign a field.').or(z.literal('')),
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
          email: '',
          password: '',
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
      return collection(firestore, 'fields');
    }

    if (userProfile.role === 'FarmManager') {
      return query(
        collection(firestore, 'fields'),
        where('managerId', '==', userProfile.id)
      );
    }

    return null;
  }, [firestore, userProfile]);
  const { data: fieldsData } = useCollection<FarmField>(fieldsQuery);

  const processSubmit = async (data: WorkerFormValues) => {
    if (!firestore || !userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'User profile not found.' });
      return;
    }
    setIsLoading(true);

    if (isEditing) {
      const workerDoc = doc(firestore, 'workers', worker.id);
      const updatedData = { ...data };
      delete (updatedData as any).email; // Do not update email/password on edit
      delete (updatedData as any).password;
      updateDocumentNonBlocking(workerDoc, updatedData);
      toast({
        title: 'Success',
        description: 'Worker profile updated.',
      });
      setIsLoading(false);
      onFormSubmit();
      return;
    }

    // --- Create New Worker Flow ---
    if (!data.email || !data.password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Email and password are required to create a new worker account.' });
      setIsLoading(false);
      return;
    }

    const tempApp = initializeApp(firebaseConfig, `worker-creation-${uuidv4()}`);
    const tempAuth = getAuth(tempApp);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(tempAuth, data.email, data.password);
      const newUserId = userCredential.user.uid;

      const batch = writeBatch(firestore);

      // 2. Create user document in 'users' collection
      const userDocRef = doc(firestore, 'users', newUserId);
      const newUserProfile: UserProfile = {
        id: newUserId,
        name: data.name,
        email: data.email,
        role: 'FarmWorker',
        status: 'active',
        createdAt: new Date().toISOString(),
        phoneNumber: data.phone,
      };
      batch.set(userDocRef, newUserProfile);

      // 3. Create worker document in 'workers' collection
      const workerDocRef = doc(firestore, 'workers', newUserId);
      const newWorkerData: Omit<Worker, 'id'> = {
        userId: newUserId,
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        assignedField: data.assignedField,
        employmentType: data.employmentType,
        wageRate: data.wageRate,
        status: data.status,
        photoUrl: data.photoUrl || `https://picsum.photos/seed/${newUserId}/100/100`,
        photoHint: 'worker portrait',
        managerId: userProfile.id,
        createdAt: new Date().toISOString(),
      };
      batch.set(workerDocRef, newWorkerData);

      // 4. Atomically commit all writes
      await batch.commit();

      toast({
        title: 'Success',
        description: 'New worker account and profile created.',
      });
      onFormSubmit();

    } catch (error: any) {
      console.error('Failed to create worker and auth user:', error);
      let description = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use by another account.';
      }
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description,
      });
    } finally {
      // 5. Clean up the temporary Firebase instance
      await signOut(tempAuth);
      await deleteApp(tempApp);
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4">
        
        {!isEditing && (
          <div className="p-4 border-l-4 border-accent bg-accent/10 rounded-r-lg">
             <p className="text-sm font-semibold text-accent-foreground/80">You are creating a new user account.</p>
             <p className="text-xs text-muted-foreground">An email and password are required for the worker to log in.</p>
          </div>
        )}

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

        {!isEditing && (
            <>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Worker's Email</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="worker@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Temporary Password</FormLabel>
                        <FormControl>
                        <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </>
        )}

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
                    <SelectItem value="Not Assigned">Not Assigned</SelectItem>
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
