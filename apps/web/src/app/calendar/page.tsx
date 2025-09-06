"use client";

import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { EventCalendar } from "@/components/event-calendar";
import { useEvents, useTaskDeadlines, useProjectDeadlines } from "@/hooks/use-events";
import type { CalendarEvent } from "@/components/types";

export default function CalendarPage() {
  const { events: calendarEvents, createEvent, updateEvent, deleteEvent, isLoading } = useEvents();
  const { events: taskDeadlines } = useTaskDeadlines();
  const { events: projectDeadlines } = useProjectDeadlines();
  // Always include deadlines as events in the calendar
  const allEvents = useMemo(() => {
    return [...calendarEvents, ...taskDeadlines, ...projectDeadlines];
  }, [calendarEvents, taskDeadlines, projectDeadlines]);

  const handleEventAdd = (event: CalendarEvent) => {
    createEvent({
      title: event.title,
      description: event.description,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      color: event.color,
      location: event.location,
    });
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    updateEvent({
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      start: updatedEvent.start,
      end: updatedEvent.end,
      allDay: updatedEvent.allDay,
      color: updatedEvent.color,
      location: updatedEvent.location,
    });
  };

  const handleEventDelete = (eventId: string) => {
    deleteEvent(eventId);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your schedule
            </p>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>
              <p className="text-muted-foreground">
                View and manage your schedule, including project deadlines and task deadlines
              </p>
            </div>
          </div>
        </div>

        <EventCalendar
          events={allEvents}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />

      </div>
    </DashboardLayout>
  );
}
