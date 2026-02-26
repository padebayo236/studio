
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
import { ProductivityForm } from './productivity-form';
import type { ProductivityEntry } from '@/lib/types';

interface ProductivityFormDialogProps {
  children: React.ReactNode;
  entryToEdit?: ProductivityEntry;
}

export function ProductivityFormDialog({
  children,
  entryToEdit,
}: ProductivityFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEditing = !!entryToEdit;

  const handleFormSubmit = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Productivity Entry' : 'Log New Productivity'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details of the work completed.
          </DialogDescription>
        </DialogHeader>
        <ProductivityForm entry={entryToEdit} onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
}
