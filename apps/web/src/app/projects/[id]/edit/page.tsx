"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProjectForm from "@/components/project-form";
import DashboardLayout from "@/components/dashboard-layout";
import { useProject } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    router.push("/projects");
  };

  const handleFormSubmit = () => {
    setIsSubmitting(true);
  };

  const handleCancel = () => {
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading project...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <button
              onClick={() => router.push("/projects")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">
            Update the details for "{project.name}"
          </p>
        </div>

        <div className="relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Updating project...</p>
              </div>
            </div>
          )}
          <ProjectForm
            project={project}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            onFormSubmit={handleFormSubmit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
