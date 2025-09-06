"use client";

import { Button } from "@/components/ui/button";
import { useTaskNotifications } from "@/hooks/use-task-notifications";

export function NotificationTest() {
  const { addNotification } = useTaskNotifications();

  const testNotifications = [
    {
      type: 'success' as const,
      title: 'Success Notification',
      message: 'This is a success notification test',
    },
    {
      type: 'error' as const,
      title: 'Error Notification',
      message: 'This is an error notification test',
    },
    {
      type: 'warning' as const,
      title: 'Warning Notification',
      message: 'This is a warning notification test',
    },
    {
      type: 'info' as const,
      title: 'Info Notification',
      message: 'This is an info notification test',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Notification Test</h2>
      <p className="text-muted-foreground">
        Click the buttons below to test different notification types:
      </p>

      <div className="grid grid-cols-2 gap-4">
        {testNotifications.map((notification, index) => (
          <Button
            key={index}
            variant={notification.type === 'error' ? 'destructive' : 'default'}
            onClick={() => addNotification(notification)}
          >
            Test {notification.type} Notification
          </Button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Task Assignment Notifications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These notifications will appear when:
        </p>
        <ul className="text-sm space-y-1">
          <li>• A new task is created and assigned to someone</li>
          <li>• An existing task is reassigned to a different person</li>
          <li>• A project manager is assigned or changed</li>
          <li>• A new project is created with a manager</li>
        </ul>
      </div>
    </div>
  );
}
