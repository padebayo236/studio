
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { FarmField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, AlertTriangle, PlusCircle, Trash2, Edit } from 'lucide-react';
import { FieldFormDialog } from '@/components/field-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FieldsPage() {
  const { userProfile, isLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

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

    return null; // Should not be reached due to page-level access control
  }, [firestore, userProfile]);

  const {
    data: fieldsData,
    isLoading,
    error,
  } = useCollection<FarmField>(fieldsQuery);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!userProfile || !['Admin', 'FarmManager'].includes(userProfile.role)) {
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
            <p>Please contact an administrator if you believe this is an error.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = (fieldId: string) => {
    if (!firestore) return;
    const fieldDocRef = doc(firestore, 'fields', fieldId);
    deleteDocumentNonBlocking(fieldDocRef);
    toast({ title: 'Field Deleted', description: 'The field has been removed.' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Farm Fields</h1>
          <p className="text-muted-foreground">
            Manage your agricultural fields and plots.
          </p>
        </div>
        <FieldFormDialog>
          <Button>
            <PlusCircle /> Add New Field
          </Button>
        </FieldFormDialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {fieldsData && fieldsData.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fieldsData.map((field) => (
            <Card key={field.id}>
              <CardHeader>
                <CardTitle>{field.name}</CardTitle>
                <CardDescription>
                  {field.size} {field.sizeUnit} - {field.season}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Main Crop:</span>
                  <span className="text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                    {field.cropType}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <FieldFormDialog fieldToEdit={field}>
                  <Button variant="outline" size="sm">
                    <Edit /> Edit
                  </Button>
                </FieldFormDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        field and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(field.id!)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12">
          <CardTitle>No Fields Found</CardTitle>
          <CardDescription className="mt-2 mb-4">
            Get started by creating your first farm field.
          </CardDescription>
          <FieldFormDialog>
            <Button>
              <PlusCircle /> Add New Field
            </Button>
          </FieldFormDialog>
        </Card>
      )}
    </div>
  );
}

