"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormActions } from "@/components/ui/form";
import { FormField as FormFieldWrapper } from "@/components/ui/form-field";
import { Select } from "@/components/ui/custom-select";
import { MultiSelect } from "@/components/ui/multi-select";
import { ImageUpload } from "@/components/ui/image-upload";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import { useProjects } from "@/hooks/use-projects";
import { useTaskNotifications } from "@/hooks/use-task-notifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const taskFormSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["todo", "in_progress", "completed", "cancelled"]).default("todo"),
  deadline: z.date().optional(),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "in_progress" | "completed" | "cancelled";
    deadline?: string;
    projectId?: string;
    assigneeId?: string;
    project?: {
      id: string;
      name: string;
    };
    assignee?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      image?: string;
    };
    tags: string[];
  };
  defaultProjectId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaskForm({ task, defaultProjectId, onSuccess, onCancel }: TaskFormProps) {
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const { users, isLoading: usersLoading } = useUsers();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { addNotification } = useTaskNotifications();

  // Debug: Log task data to see the structure
  if (task) {
    console.log('Task data in form:', task);
    console.log('Project ID:', task.projectId);
    console.log('Project object:', task.project);
    console.log('Assignee ID:', task.assigneeId);
    console.log('Assignee object:', task.assignee);
  }

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) {
        const updatedTask = await updateTaskMutation.mutateAsync({
          id: task.id,
          ...data,
        });
        toast.success("Task updated successfully!");

        // Show notification if task was assigned to someone
        if (data.assigneeId && data.assigneeId !== task.assigneeId) {
          const assignee = users?.find(user => user.id === data.assigneeId);
          if (assignee) {
            addNotification({
              type: 'info',
              title: 'Task Assignment Updated',
              message: `"${data.title}" has been assigned to ${assignee.firstName} ${assignee.lastName}`,
              autoClose: true,
              duration: 6000,
            });
          }
        }
      } else {
        const newTask = await createTaskMutation.mutateAsync(data);
        toast.success("Task created successfully!");

        // Show notification if task was assigned to someone
        if (data.assigneeId) {
          const assignee = users?.find(user => user.id === data.assigneeId);
          if (assignee) {
            addNotification({
              type: 'info',
              title: 'New Task Assigned',
              message: `"${data.title}" has been assigned to ${assignee.firstName} ${assignee.lastName}`,
              autoClose: true,
              duration: 6000,
            });
          }
        }
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(task ? "Failed to update task. Please try again." : "Failed to create task. Please try again.");
    }
  };

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending;

  const userOptions = users?.map(user => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} (${user.email})`,
  })) || [];

  const projectOptions = projects?.map(project => ({
    value: project.id,
    label: project.name,
  })) || [];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form
        schema={taskFormSchema}
        defaultValues={{
          title: task?.title || "",
          description: task?.description || "",
          image: task?.image || "",
          priority: task?.priority || "medium",
          status: task?.status || "todo",
          deadline: task?.deadline ? new Date(task.deadline) : undefined,
          projectId: task?.projectId || task?.project?.id || defaultProjectId || "",
          assigneeId: task?.assigneeId || task?.assignee?.id || "",
          tags: task?.tags || [],
        }}
        onSubmit={onSubmit}
      >
        {(form) => (
          <div className="space-y-8">
            {/* Task Title */}
            <FormField
              form={form}
              name="title"
              label="Task Title"
              required
            >
              {({ value, onChange, error }) => (
                <Input
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Enter task title"
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
                  placeholder="Enter task description"
                  rows={4}
                />
              )}
            </FormField>

            {/* Project Selection */}
            <FormField
              form={form}
              name="projectId"
              label="Project"
              required
            >
              {({ value, onChange, error }) => (
                <div className="space-y-2">
                  <Select
                    options={projectOptions}
                    value={value || ""}
                    onChange={onChange}
                    placeholder="Select a project"
                    disabled={projectsLoading}
                    error={!!error}
                  />
                  {task?.project && !value && (
                    <p className="text-sm text-muted-foreground">
                      Current: {task.project.name}
                    </p>
                  )}
                </div>
              )}
            </FormField>

            {/* Assignee */}
            <FormField
              form={form}
              name="assigneeId"
              label="Assignee"
            >
              {({ value, onChange }) => (
                <div className="space-y-2">
                  <Select
                    options={userOptions}
                    value={value || ""}
                    onChange={onChange}
                    placeholder="Select an assignee"
                    disabled={usersLoading}
                  />
                  {task?.assignee && !value && (
                    <p className="text-sm text-muted-foreground">
                      Current: {task.assignee.firstName} {task.assignee.lastName} ({task.assignee.email})
                    </p>
                  )}
                </div>
              )}
            </FormField>

            {/* Image Upload */}
            <FormField
              form={form}
              name="image"
              label="Task Image"
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
                      { value: "todo", label: "To Do" },
                      { value: "in_progress", label: "In Progress" },
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
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
              </Button>
            </FormActions>
          </div>
        )}
      </Form>
    </div>
  );
}
