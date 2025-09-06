"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProjectForm from "@/components/project-form";
import DashboardLayout from "@/components/dashboard-layout";

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    router.push("/projects");
  };

  const handleCancel = () => {
    router.push("/projects");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new project for your team.
          </p>
        </div>

        <ProjectForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}
