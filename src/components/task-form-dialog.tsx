"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { TaskForm } from "./task-form"
import type { Task } from "@/lib/types"

interface TaskFormDialogProps {
  onTaskCreate: (task: Omit<Task, 'taskId'>) => void;
}

export function TaskFormDialog({ onTaskCreate }: TaskFormDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleFormSubmit = (data: Omit<Task, 'taskId'>) => {
    onTaskCreate(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for the new farm task. Click "Generate with AI" for a detailed description.
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  )
}
