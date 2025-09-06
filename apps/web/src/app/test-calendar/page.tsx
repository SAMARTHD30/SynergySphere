"use client";

import { useState } from "react";
import { EventCalendar } from "@/components/event-calendar";
import { useEvents } from "@/hooks/use-events";
import type { CalendarEvent } from "@/components/types";

export default function TestCalendarPage() {
  const { events, createEvent, updateEvent, deleteEvent, isLoading, error } = useEvents();
  const [testEvent, setTestEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    allDay: false,
    color: "sky",
    location: "",
  });

  const handleCreateTestEvent = () => {
    if (testEvent.title && testEvent.start && testEvent.end) {
      createEvent({
        title: testEvent.title,
        description: testEvent.description,
        start: testEvent.start,
        end: testEvent.end,
        allDay: testEvent.allDay,
        color: testEvent.color,
        location: testEvent.location,
      });
    }
  };

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
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Calendar</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Test Calendar Integration</h1>
        <p className="text-muted-foreground">
          Testing calendar with real database data
        </p>
      </div>

      {/* Test Event Creation */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create Test Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={testEvent.title || ""}
              onChange={(e) => setTestEvent({ ...testEvent, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Event title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={testEvent.location || ""}
              onChange={(e) => setTestEvent({ ...testEvent, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Event location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={testEvent.start ? testEvent.start.toISOString().slice(0, 16) : ""}
              onChange={(e) => setTestEvent({ ...testEvent, start: new Date(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              type="datetime-local"
              value={testEvent.end ? testEvent.end.toISOString().slice(0, 16) : ""}
              onChange={(e) => setTestEvent({ ...testEvent, end: new Date(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <button
          onClick={handleCreateTestEvent}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create Test Event
        </button>
      </div>

      {/* Events List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Events ({events.length})</h2>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.start.toLocaleString()} - {event.end.toLocaleString()}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-sm text-muted-foreground">📍 {event.location}</p>
                  )}
                </div>
                <button
                  onClick={() => handleEventDelete(event.id)}
                  className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Component */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
        <EventCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
    </div>
  );
}
