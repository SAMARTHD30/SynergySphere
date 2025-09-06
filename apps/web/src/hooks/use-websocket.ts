"use client";

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/contexts/notification-context';

interface WebSocketMessage {
  type: 'project_created' | 'project_updated' | 'project_deleted' |
        'task_created' | 'task_updated' | 'task_deleted' |
        'project_member_added' | 'project_member_removed' |
        'event_created' | 'event_updated' | 'event_deleted' |
        'notification';
  data: any;
  projectId?: string;
  taskId?: string;
  eventId?: string;
  notification?: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    autoClose?: boolean;
    duration?: number;
  };
}

export function useWebSocket() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    const connect = () => {
      try {
        // Use the same port as the server (3001) for WebSocket
        const wsUrl = `ws://localhost:3001?token=${session.accessToken}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            
            // Handle notification messages
            if (message.type === 'notification' && message.notification) {
              addNotification(message.notification);
            }
            
            // Handle other real-time updates
            switch (message.type) {
              case 'task_created':
              case 'task_updated':
              case 'task_deleted':
                console.log('Task update received:', message);
                break;
              case 'project_created':
              case 'project_updated':
              case 'project_deleted':
                console.log('Project update received:', message);
                break;
              default:
                console.log('WebSocket message received:', message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [session?.accessToken, addNotification]);

  return {
    isConnected,
    sendMessage: (message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    }
  };
}
