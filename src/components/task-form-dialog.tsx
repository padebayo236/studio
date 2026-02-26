
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskForm } from './task-form';
import type { FarmTask } from '@/lib/types';

interface TaskFormDialogProps {
  children: React.ReactNode;
  taskToEdit?: FarmTask;
}

export function TaskFormDialog({
  children,
  taskToEdit,
}: TaskFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEditing = !!taskToEdit;

  const handleFormSubmit = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the farm task. Click "Generate with AI" for a detailed description.
          </DialogDescription>
        </DialogHeader>
        <TaskForm task={taskToEdit} onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
}
