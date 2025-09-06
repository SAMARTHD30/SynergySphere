"use client";

import { useSession } from 'next-auth/react';
import { useNotifications } from '@/contexts/notification-context';

export function useTaskNotifications() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();

  // Helper function to show task assignment notifications
  const showTaskAssignmentNotification = (task: any, assigneeId: string) => {
    // Only show notification if the current user is the assignee
    if (assigneeId === session?.user?.id) {
      addNotification({
        type: 'info',
        title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}" in ${task.project?.name || 'a project'}`,
        autoClose: true,
        duration: 8000,
      });
    }
  };

  // Helper function to show task reassignment notifications
  const showTaskReassignmentNotification = (task: any, oldAssigneeId: string, newAssigneeId: string) => {
    // Show notification if the current user is the new assignee
    if (newAssigneeId === session?.user?.id) {
      addNotification({
        type: 'info',
        title: 'Task Reassigned',
        message: `"${task.title}" has been reassigned to you in ${task.project?.name || 'a project'}`,
        autoClose: true,
        duration: 8000,
      });
    }
  };

  return {
    addNotification,
    showTaskAssignmentNotification,
    showTaskReassignmentNotification,
  };
}
