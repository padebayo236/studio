
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { generateTaskDescriptionAction } from "@/app/actions"
import type { FarmTask, CropType, TaskType, FarmField, Worker } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { useUserProfile } from "@/hooks/use-user-profile"
import { collection, doc, query, where } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid';

const taskSchema = z.object({
  taskType: z.string({ required_error: "Please select a task type." }),
  cropType: z.string({ required_error: "Please select a crop type." }),
  fieldId: z.string().min(1, "Field name is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  deadline: z.date({ required_error: "A deadline is required." }),
  expectedOutput: z.coerce.number().min(1, "Expected output must be at least 1."),
  expectedOutputUnit: z.string().min(1, "Unit is required, e.g., kg, acres."),
  assignedWorkerIds: z.array(z.string()).min(1, "Assign at least one worker."),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
    task?: FarmTask;
    onFormSubmit: () => void;
}

export function TaskForm({ task, onFormSubmit }: TaskFormProps) {
  const { userProfile } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditing = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: isEditing
      ? {
          ...task,
          deadline: new Date(task.deadline),
        }
      : {
          taskType: undefined,
          cropType: undefined,
          fieldId: undefined,
          description: "",
          deadline: undefined,
          expectedOutput: 0,
          expectedOutputUnit: 'kg',
          assignedWorkerIds: [],
        },
  })

  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile) return null;
    if (userProfile.role === 'Admin') {
        return collection(firestore, 'farm_fields');
    }
    if (userProfile.role === 'FarmManager') {
        return query(collection(firestore, 'farm_fields'), where('managerId', '==', userProfile.id));
    }
    return null;
  }, [firestore, userProfile]);
  const { data: fieldsData } = useCollection<FarmField>(fieldsQuery);
  
  const workersQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile) return null;

    // This form is only used by Admins and FarmManagers
    if (userProfile.role === 'Admin') {
      return collection(firestore, 'farm_workers');
    }
    if (userProfile.role === 'FarmManager') {
      return query(
        collection(firestore, 'farm_workers'),
        where('managerId', '==', userProfile.id)
      );
    }
    return null;
  }, [firestore, userProfile]);
  const { data: workersData } = useCollection<Worker>(workersQuery);


  const handleGenerateDescription = async () => {
    const { cropType, taskType, fieldId } = form.getValues();
    if (!cropType || !taskType) {
      form.setError("description", { message: "Please select Crop and Task type first." });
      return;
    }
    setIsGenerating(true);
    try {
      const fieldName = fieldsData?.find(f => f.id === fieldId)?.name;
      const result = await generateTaskDescriptionAction({
        cropType: cropType as CropType,
        taskType: taskType as TaskType,
        fieldName,
      });
      if (result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
      }
    } catch (error) {
      console.error("AI generation failed", error);
      form.setError("description", { message: "AI generation failed. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const processSubmit = (data: TaskFormValues) => {
    if (!firestore || !userProfile) return;
    setIsSubmitting(true);
    
    const taskData = {
        ...data,
        deadline: data.deadline.toISOString(),
        managerId: userProfile.id,
        status: task?.status || 'Pending',
    };

    if (isEditing) {
        const taskRef = doc(firestore, 'farm_tasks', task.id!);
        updateDocumentNonBlocking(taskRef, taskData);
        toast({ title: "Task Updated", description: "The task has been successfully updated." });
    } else {
        const tasksCollection = collection(firestore, 'farm_tasks');
        addDocumentNonBlocking(tasksCollection, {
            ...taskData,
            createdAt: new Date().toISOString(),
        });
        toast({ title: "Task Created", description: "The new task has been successfully created." });
    }

    setIsSubmitting(false);
    onFormSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="taskType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Task Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a task" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Planting">Planting</SelectItem>
                        <SelectItem value="Weeding">Weeding</SelectItem>
                        <SelectItem value="Harvesting">Harvesting</SelectItem>
                        <SelectItem value="Irrigation">Irrigation</SelectItem>
                        <SelectItem value="Fertilizer Application">Fertilizer Application</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="cropType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Crop Type</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between items-center">
                Description
                <Button type="button" size="sm" variant="outline" onClick={handleGenerateDescription} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Harvest ripe tomatoes carefully and place them in crates." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fieldId"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Field</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a field" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {fieldsData?.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-2">
                <FormField
                    control={form.control}
                    name="expectedOutput"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Expected Output</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="expectedOutputUnit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl><Input placeholder="e.g., kg" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
        
        <FormField
            control={form.control}
            name="assignedWorkerIds"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Assign Worker</FormLabel>
                {/* This only supports single worker assignment for simplicity, but the schema supports multiple */}
                <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a worker" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {workersData?.filter(w => w.status === 'Active').map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Task"}
            </Button>
        </div>
      </form>
    </Form>
  )
}
