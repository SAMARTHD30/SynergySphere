"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormActions } from "@/components/ui/form";
import { FormField as FormFieldWrapper } from "@/components/ui/form-field";
import { Select } from "@/components/ui/custom-select";
import { MultiSelect } from "@/components/ui/multi-select";
import { ImageUpload } from "@/components/ui/image-upload";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { useTaskNotifications } from "@/hooks/use-task-notifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["active", "completed", "on_hold", "cancelled"]).default("active"),
  deadline: z.date().optional(),
  projectManagerId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    priority: "low" | "medium" | "high";
    status: "active" | "completed" | "on_hold" | "cancelled";
    deadline?: string;
    projectManagerId?: string;
    projectManager?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      image?: string;
    };
    tags: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  onFormSubmit?: () => void;
}

export default function ProjectForm({ project, onSuccess, onCancel, onFormSubmit }: ProjectFormProps) {
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const { users, isLoading: usersLoading } = useUsers();
  const { addNotification } = useTaskNotifications();

  // Debug: Log project data to see the structure
  if (project) {
    console.log('Project data in form:', project);
    console.log('Project manager ID:', project.projectManagerId);
    console.log('Project manager object:', project.projectManager);
  }

  const onSubmit = async (data: ProjectFormData) => {
    onFormSubmit?.();
    try {
      if (project) {
        const updatedProject = await updateProjectMutation.mutateAsync({
          id: project.id,
          ...data,
        });
        toast.success("Project updated successfully!");

        // Show notification if project manager was changed
        if (data.projectManagerId && data.projectManagerId !== project.projectManagerId) {
          const manager = users?.find(user => user.id === data.projectManagerId);
          if (manager) {
            addNotification({
              type: 'info',
              title: 'Project Manager Updated',
              message: `"${data.name}" project manager has been changed to ${manager.firstName} ${manager.lastName}`,
              autoClose: true,
              duration: 6000,
            });
          }
        }
      } else {
        const newProject = await createProjectMutation.mutateAsync(data);
        toast.success("Project created successfully!");

        // Show notification if project has a manager
        if (data.projectManagerId) {
          const manager = users?.find(user => user.id === data.projectManagerId);
          if (manager) {
            addNotification({
              type: 'success',
              title: 'New Project Created',
              message: `"${data.name}" project has been created with ${manager.firstName} ${manager.lastName} as manager`,
              autoClose: true,
              duration: 6000,
            });
          }
        }
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(project ? "Failed to update project. Please try again." : "Failed to create project. Please try again.");
    }
  };

  const isLoading = createProjectMutation.isPending || updateProjectMutation.isPending;

  const userOptions = users?.map(user => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} (${user.email})`,
  })) || [];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form
        schema={projectFormSchema}
        defaultValues={{
          name: project?.name || "",
          description: project?.description || "",
          image: project?.image || "",
          priority: project?.priority || "medium",
          status: project?.status || "active",
          deadline: project?.deadline ? new Date(project.deadline) : undefined,
          projectManagerId: project?.projectManagerId || project?.projectManager?.id || "",
          tags: project?.tags || [],
        }}
        onSubmit={onSubmit}
      >
        {(form) => (
          <div className="space-y-8">
            {/* Project Name */}
            <FormField
              form={form}
              name="name"
              label="Project Name"
              required
            >
              {({ value, onChange, error }) => (
                <Input
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Enter project name"
                  className={cn(error && "border-red-500")}
                />
              )}
            </FormField>

            {/* Description */}
            <FormField
              form={form}
              name="description"
              label="Description"
            >
              {({ value, onChange }) => (
                <Textarea
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                />
              )}
            </FormField>

            {/* Image Upload */}
            <FormField
              form={form}
              name="image"
              label="Project Image"
            >
              {({ value, onChange }) => (
                <ImageUpload
                  value={value || ""}
                  onChange={onChange}
                  maxSize={5}
                />
              )}
            </FormField>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                form={form}
                name="priority"
                label="Priority"
              >
                {({ value, onChange }) => (
                  <Select
                    options={[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                    ]}
                    value={value}
                    onChange={onChange}
                    placeholder="Select priority"
                  />
                )}
              </FormField>

              <FormField
                form={form}
                name="status"
                label="Status"
              >
                {({ value, onChange }) => (
                  <Select
                    options={[
                      { value: "active", label: "Active" },
                      { value: "on_hold", label: "On Hold" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                    value={value}
                    onChange={onChange}
                    placeholder="Select status"
                  />
                )}
              </FormField>
            </div>

            {/* Project Manager */}
            <FormField
              form={form}
              name="projectManagerId"
              label="Project Manager"
            >
              {({ value, onChange }) => (
                <div className="space-y-2">
                  <Select
                    options={userOptions}
                    value={value || ""}
                    onChange={onChange}
                    placeholder="Select a project manager"
                    disabled={usersLoading}
                  />
                  {project?.projectManager && !value && (
                    <p className="text-sm text-muted-foreground">
                      Current: {project.projectManager.firstName} {project.projectManager.lastName} ({project.projectManager.email})
                    </p>
                  )}
                </div>
              )}
            </FormField>

            {/* Deadline */}
            <FormField
              form={form}
              name="deadline"
              label="Deadline"
            >
              {({ value, onChange }) => (
                <DatePicker
                  value={value}
                  onChange={onChange}
                  placeholder="Pick a deadline"
                />
              )}
            </FormField>

            {/* Tags */}
            <FormField
              form={form}
              name="tags"
              label="Tags"
            >
              {({ value, onChange }) => (
                <MultiSelect
                  value={value || []}
                  onChange={onChange}
                  placeholder="Add tags"
                  maxItems={10}
                />
              )}
            </FormField>

            {/* Form Actions */}
            <FormActions>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (project ? "Updating..." : "Creating...") : (project ? "Update Project" : "Create Project")}
              </Button>
            </FormActions>
          </div>
        )}
      </Form>
    </div>
  );
}
