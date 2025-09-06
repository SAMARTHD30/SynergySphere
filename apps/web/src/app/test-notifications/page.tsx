import { NotificationTest } from "@/components/notification-test";

export default function TestNotificationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🎉 Notification System Active!
        </h2>
        <p className="text-blue-700 dark:text-blue-300">
          The notification system is now integrated into the navbar. You can see notifications in the top-right corner
          of the page. Try creating or editing tasks/projects to see real notifications appear!
        </p>
      </div>

      <NotificationTest />

      <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          ✨ New Features Added:
        </h3>
        <ul className="text-green-700 dark:text-green-300 space-y-1">
          <li>• <strong>Notification Dropdown:</strong> Click the bell icon in the navbar to see all notifications</li>
          <li>• <strong>Theme Switcher:</strong> Use the new theme switcher (Sun/Moon/Monitor icons) to change themes</li>
          <li>• <strong>Real-time Notifications:</strong> Get notified when tasks are assigned or projects are created</li>
          <li>• <strong>Project Access:</strong> Assigned users automatically get access to projects</li>
          <li>• <strong>Auto-clear:</strong> Notifications auto-close after 6-8 seconds</li>
        </ul>
      </div>
    </div>
  );
}
