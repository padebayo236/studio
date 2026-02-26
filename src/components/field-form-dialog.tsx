
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
import { FieldForm } from './field-form';
import type { FarmField } from '@/lib/types';

interface FieldFormDialogProps {
  children: React.ReactNode;
  fieldToEdit?: FarmField;
}

export function FieldFormDialog({
  children,
  fieldToEdit,
}: FieldFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEditing = !!fieldToEdit;

  const handleFormSubmit = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Field' : 'Create New Field'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the farm field.
          </DialogDescription>
        </DialogHeader>
        <FieldForm field={fieldToEdit} onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
}
