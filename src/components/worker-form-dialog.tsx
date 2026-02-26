
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
import { WorkerForm } from './worker-form';
import type { Worker } from '@/lib/types';

interface WorkerFormDialogProps {
  children: React.ReactNode;
  workerToEdit?: Worker;
}

export function WorkerFormDialog({
  children,
  workerToEdit,
}: WorkerFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEditing = !!workerToEdit;

  const handleFormSubmit = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Worker Profile' : 'Create New Worker'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the worker's details below."
              : 'Fill in the details for the new worker.'}
          </DialogDescription>
        </DialogHeader>
        <WorkerForm worker={workerToEdit} onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
}
