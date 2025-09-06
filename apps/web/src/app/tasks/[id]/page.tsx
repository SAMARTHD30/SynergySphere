"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, User, Flag, CheckCircle, AlertTriangle, Play, Pause, Archive } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useTask } from "@/hooks/use-tasks";
import { UserAvatarWithName } from "@/components/user-avatar";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// Helper function to get status/priority styling
const getStatusConfig = (type: 'status' | 'priority', value: string) => {
  if (type === 'status') {
    switch (value) {
      case 'todo':
        return {
          icon: Play,
          color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
          label: 'To Do'
        };
      case 'in_progress':
        return {
          icon: Play,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
          label: 'In Progress'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-green-500/20 text-green-400 border-green-400/30',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          icon: Archive,
          color: 'bg-red-500/20 text-red-400 border-red-400/30',
          label: 'Cancelled'
        };
      default:
        return {
          icon: Play,
          color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
          label: value
        };
    }
  } else { // priority
    switch (value) {
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'bg-red-500/20 text-red-400 border-red-400/30',
          label: 'High'
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
          label: 'Medium'
        };
      case 'low':
        return {
          icon: CheckCircle,
          color: 'bg-green-500/20 text-green-400 border-green-400/30',
          label: 'Low'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
          label: value
        };
    }
  }
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const { data: task, isLoading, error } = useTask(taskId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
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
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Task Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The task you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push("/tasks")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig('status', task.status);
  const priorityConfig = getStatusConfig('priority', task.priority);
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/tasks")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{task.title}</h1>
              <p className="text-muted-foreground">
                {task.project?.name && `Part of ${task.project.name}`}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/tasks/${task.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {task.description || "No description provided for this task."}
                </p>
              </CardContent>
            </Card>

            {/* Task Image */}
            {task.image && (
              <Card>
                <CardHeader>
                  <CardTitle>Task Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={task.image}
                    alt={task.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status and Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PriorityIcon className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Priority</p>
                    <Badge className={priorityConfig.color}>
                      {priorityConfig.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignee */}
            <Card>
              <CardHeader>
                <CardTitle>Assignee</CardTitle>
              </CardHeader>
              <CardContent>
                {task.assignee ? (
                  <UserAvatarWithName
                    user={task.assignee}
                    size="lg"
                    showEmail
                    tooltipContent="Task Assignee"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">No assignee</p>
                      <p className="text-xs">This task is not assigned to anyone</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project */}
            {task.project && (
              <Card>
                <CardHeader>
                  <CardTitle>Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {task.project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{task.project.name}</p>
                      <p className="text-sm text-muted-foreground">Project</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deadline */}
            {task.deadline && (
              <Card>
                <CardHeader>
                  <CardTitle>Deadline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(task.deadline), "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(task.deadline), "EEEE, MMMM do, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Created Date */}
            <Card>
              <CardHeader>
                <CardTitle>Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(task.createdAt), "PPP")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(task.createdAt), "EEEE, MMMM do, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
