
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
  } from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import type { UserProfile, Worker } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Please enter your name.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  role: z.string().min(1, { message: 'Please select a role.' }),
});

type UserFormValue = z.infer<typeof formSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'FarmManager'
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user) {
        const userId = userCredential.user.uid;
        
        await updateProfile(userCredential.user, {
            displayName: data.name
        });

        const batch = writeBatch(firestore);

        // 1. Create main user profile in 'users' collection
        const userProfileRef = doc(firestore, 'users', userId);
        const profileData: UserProfile = {
            id: userId,
            name: data.name,
            email: data.email,
            role: data.role as UserProfile['role'],
            status: 'active',
            createdAt: new Date().toISOString(),
        };
        batch.set(userProfileRef, profileData);

        // 2. If user is a worker, create a profile in 'workers' collection
        if (data.role === 'FarmWorker') {
            const workerDocRef = doc(firestore, 'workers', userId);
            const workerProfileData: Omit<Worker, 'id'> = {
                userId: userId,
                name: data.name,
                phone: '',
                age: 0,
                gender: 'Other',
                address: '',
                employmentType: 'Not Assigned',
                wageRate: 0,
                assignedField: '',
                status: 'Active',
                managerId: '',
                photoUrl: `https://picsum.photos/seed/${userId}/100/100`,
                photoHint: 'worker portrait',
                createdAt: new Date().toISOString(),
            };
            batch.set(workerDocRef, workerProfileData);
        }

        // Atomically commit both writes
        await batch.commit().catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: `batch write for user ${userId}`,
              operation: 'create',
              requestResourceData: { user: profileData },
            });
            errorEmitter.emit('permission-error', permissionError);
          });
        
      } else {
        throw new Error("User creation failed.");
      }
    } catch (error: any) {
        let description = "An unexpected error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already in use. Please try another one.';
        }
        toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description,
        });
        setIsLoading(false);
        return; // Stop execution
    }
  };

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 px-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  {...field}
                />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
              <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      <SelectItem value="Admin">Admin (Farm Owner)</SelectItem>
                      <SelectItem value="FarmManager">Farm Manager</SelectItem>
                      <SelectItem value="FarmWorker">Farm Worker</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                  </SelectContent>
              </Select>
              <FormMessage />
              </FormItem>
          )}
        />
        <Button disabled={isLoading} className="w-full" type="submit">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
