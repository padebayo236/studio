"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import type { ProductivityEntry, FarmField, Worker, FarmTask } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { useUserProfile } from "@/hooks/use-user-profile"
import { collection, doc, query, where } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"
import { useWorkers, useTasks } from "@/hooks/data/use-operational-data"

const productivitySchema = z.object({
  workerId: z.string().min(1, "Please select a worker."),
  taskId: z.string().min(1, "Please select a task."),
  date: z.date({ required_error: "A date is required." }),
  outputQuantity: z.coerce.number().min(0, "Output must be a positive number."),
  outputUnit: z.string().min(1, "Unit is required, e.g., kg, acres."),
  hoursWorkedForEntry: z.coerce.number().min(0.1, "Hours worked must be greater than 0."),
  notes: z.string().optional(),
});

type ProductivityFormValues = z.infer<typeof productivitySchema>;

interface ProductivityFormProps {
    entry?: ProductivityEntry;
    onFormSubmit: () => void;
}

export function ProductivityForm({ entry, onFormSubmit }: ProductivityFormProps) {
  const { user, userProfile } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!entry;

  const form = useForm<ProductivityFormValues>({
    resolver: zodResolver(productivitySchema),
    defaultValues: isEditing
      ? {
          ...entry,
          date: new Date(entry.date),
        }
      : {
          workerId: userProfile?.role === 'FarmWorker' ? user?.uid : undefined,
          taskId: undefined,
          date: new Date(),
          outputQuantity: 0,
          outputUnit: 'kg',
          hoursWorkedForEntry: 0,
          notes: "",
        },
  })

  // Data for form dropdowns
  const { data: workersData } = useWorkers();
  const { data: allTasksData } = useTasks();


  const selectedWorkerId = form.watch("workerId");
  
  const tasksData = React.useMemo(() => {
    if (!allTasksData || !selectedWorkerId) return [];
    return allTasksData.filter(task => task.assignedWorkerIds.includes(selectedWorkerId));
  }, [allTasksData, selectedWorkerId]);


  const processSubmit = (data: ProductivityFormValues) => {
    if (!firestore || !userProfile) return;

    // Find the task to get the fieldId
    const task = allTasksData?.find(t => t.id === data.taskId);
    if (!task) {
        toast({ variant: "destructive", title: "Error", description: "Selected task not found." });
        return;
    }

    setIsSubmitting(true);
    
    const entryData = {
        ...data,
        fieldId: task.fieldId, // Get fieldId from the selected task
        date: data.date.toISOString().split('T')[0], // "YYYY-MM-DD"
    };

    if (isEditing) {
        const entryRef = doc(firestore, 'productivity', entry.id!);
        updateDocumentNonBlocking(entryRef, entryData);
        toast({ title: "Entry Updated", description: "The productivity entry has been updated." });
    } else {
        const entriesCollection = collection(firestore, 'productivity');
        addDocumentNonBlocking(entriesCollection, {
            ...entryData,
            createdAt: new Date().toISOString(),
        });
        toast({ title: "Entry Logged", description: "The new productivity entry has been created." });
    }

    setIsSubmitting(false);
    onFormSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4">
        {userProfile?.role !== 'FarmWorker' && (
            <FormField
                control={form.control}
                name="workerId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Worker</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a worker" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {workersData?.filter(w => w.status === 'Active').map(w => <SelectItem key={w.id} value={w.id!}>{w.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}
        
        <FormField
          control={form.control}
          name="taskId"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Task</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedWorkerId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a task for the chosen worker" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {tasksData?.map(t => <SelectItem key={t.id} value={t.id!}>{t.taskType} - {t.cropType}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Work</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="outputQuantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Output Quantity</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="outputUnit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl><Input placeholder="e.g., kg, acres, rows" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="hoursWorkedForEntry"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hours Worked</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="e.g., 8" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional comments..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Log Entry"}
            </Button>
        </div>
      </form>
    </Form>
  )
}
