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
import { CalendarIcon, Sparkles } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { generateTaskDescriptionAction } from "@/app/actions"
import { demoData } from "@/lib/demo-data"
import type { CropType, TaskType } from "@/lib/types"

const taskSchema = z.object({
  taskType: z.string({ required_error: "Please select a task type." }),
  cropType: z.string({ required_error: "Please select a crop type." }),
  fieldName: z.string().min(1, "Field name is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  deadline: z.date({ required_error: "A deadline is required." }),
  expectedOutput: z.coerce.number().min(1, "Expected output must be at least 1."),
  assignedWorkers: z.array(z.string()).min(1, "Assign at least one worker."),
  status: z.enum(["Pending", "In Progress", "Completed"]),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: Omit<z.infer<typeof taskSchema>, 'status'>) => void;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: "",
      assignedWorkers: [],
      status: "Pending",
    },
  })

  const handleGenerateDescription = async () => {
    const { cropType, taskType } = form.getValues();
    if (!cropType || !taskType) {
      form.setError("description", { message: "Please select Crop and Task type first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateTaskDescriptionAction({
        cropType: cropType as CropType,
        taskType: taskType as TaskType,
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
    onSubmit({ ...data, deadline: data.deadline.toISOString() });
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
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a task" /></SelectTrigger>
                    </FormControl>
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
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger>
                    </FormControl>
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
                  <Sparkles className="mr-2 h-4 w-4" />
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
          name="fieldName"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Field</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a field" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {demoData.fields.map(f => <SelectItem key={f.fieldId} value={f.fieldName}>{f.fieldName}</SelectItem>)}
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
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="expectedOutput"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Expected Output (kg)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 200" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
            control={form.control}
            name="assignedWorkers"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Assign Workers</FormLabel>
                <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a worker" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {demoData.workers.filter(w => w.status === 'Active').map(w => <SelectItem key={w.workerId} value={w.workerId}>{w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end pt-4">
            <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Form>
  )
}
