"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TaskForm from "@/components/task-form";
import DashboardLayout from "@/components/dashboard-layout";

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    router.push("/tasks");
  };

  const handleCancel = () => {
    router.push("/tasks");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new task for your project.
          </p>
        </div>

        <TaskForm
          defaultProjectId={projectId || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}
