"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TaskForm from "@/components/task-form";
import DashboardLayout from "@/components/dashboard-layout";
import { useTask } from "@/hooks/use-tasks";
import { Loader2 } from "lucide-react";

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const { data: task, isLoading, error } = useTask(taskId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    router.push("/tasks");
  };

  const handleCancel = () => {
    router.push("/tasks");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading task...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Task Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The task you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <button
              onClick={() => router.push("/tasks")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Task</h1>
          <p className="text-muted-foreground">
            Update the details for "{task.title}"
          </p>
        </div>

        <TaskForm
          task={task}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}
