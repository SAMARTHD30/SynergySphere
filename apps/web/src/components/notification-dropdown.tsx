"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, X } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.length;

  const handleNotificationClick = (notificationId: string) => {
    // You can add logic here to handle notification clicks
    // For example, navigate to a specific page or mark as read
    console.log('Notification clicked:', notificationId);
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]" align="end">
        <div className="flex items-center justify-between p-3 pb-2 border-b">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    "border-l-4",
                    notification.type === 'success' && "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
                    notification.type === 'error' && "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
                    notification.type === 'warning' && "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
                    notification.type === 'info' && "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <h4 className="text-sm font-medium mb-1 truncate">
                        {notification.title}
                      </h4>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
