"use client";

import * as React from "react";
import { useForm, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface FormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  });

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {children(form)}
    </form>
  );
}

// Form Field with error handling
interface FormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  children: (field: {
    value: any;
    onChange: (value: any) => void;
    error?: string;
  }) => React.ReactNode;
  className?: string;
}

export function FormField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  required,
  children,
  className,
}: FormFieldProps<T>) {
  const {
    formState: { errors },
  } = form;

  const error = errors[name]?.message as string | undefined;
  const value = form.watch(name);

  const onChange = (newValue: any) => {
    form.setValue(name, newValue, { shouldValidate: true });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children({ value, onChange, error })}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Form Actions component
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex justify-end space-x-4 pt-4", className)}>
      {children}
    </div>
  );
}
