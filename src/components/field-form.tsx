
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
import type { FarmField, CropType } from '@/lib/types';
import { useFirestore, useUserProfile } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const fieldSchema = z.object({
  name: z.string().min(2, 'Field name must be at least 2 characters.'),
  size: z.coerce.number().min(0.1, 'Size must be a positive number.'),
  sizeUnit: z.enum(['acres', 'hectares']),
  cropType: z.string().min(1, 'Please select a crop type.'),
  season: z.string().min(3, 'Season is required, e.g., "Spring 2024".'),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

interface FieldFormProps {
  field?: FarmField;
  onFormSubmit: () => void;
}

export function FieldForm({ field, onFormSubmit }: FieldFormProps) {
  const { userProfile } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditing = !!field;

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: isEditing
      ? field
      : {
          name: '',
          size: 10,
          sizeUnit: 'acres',
          cropType: 'Maize',
          season: `Season ${new Date().getFullYear()}`,
        },
  });

  const processSubmit = (data: FieldFormValues) => {
    if (!firestore || !userProfile) return;
    setIsLoading(true);

    const fieldData = {
      ...data,
      managerId: userProfile.id,
    };
    
    const fieldsCollection = collection(firestore, 'farm_fields');

    if (isEditing) {
        const fieldDoc = doc(fieldsCollection, field.id!);
        updateDocumentNonBlocking(fieldDoc, fieldData);
        toast({ title: "Field Updated", description: "The field has been successfully updated." });
    } else {
        addDocumentNonBlocking(fieldsCollection, {
            ...fieldData,
            createdAt: new Date().toISOString(),
        });
        toast({ title: "Field Created", description: "The new field has been created." });
    }

    setIsLoading(false);
    onFormSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., North Field" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sizeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="acres">Acres</SelectItem>
                    <SelectItem value="hectares">Hectares</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="cropType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Main Crop Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Maize">Maize</SelectItem>
                        <SelectItem value="Rice">Rice</SelectItem>
                        <SelectItem value="Tomato">Tomato</SelectItem>
                        <SelectItem value="Cassava">Cassava</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="season"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Season</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Spring 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Field'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
