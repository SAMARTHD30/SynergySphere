import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Create events table manually
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "start" timestamp NOT NULL,
        "end" timestamp NOT NULL,
        "all_day" boolean DEFAULT false,
        "color" text DEFAULT 'sky',
        "location" text,
        "project_id" uuid,
        "task_id" uuid,
        "created_by_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Add foreign key constraints
    await db.execute(`
      ALTER TABLE "events"
      ADD CONSTRAINT IF NOT EXISTS "events_project_id_projects_id_fk"
      FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    `);

    await db.execute(`
      ALTER TABLE "events"
      ADD CONSTRAINT IF NOT EXISTS "events_task_id_tasks_id_fk"
      FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;
    `);

    await db.execute(`
      ALTER TABLE "events"
      ADD CONSTRAINT IF NOT EXISTS "events_created_by_id_users_id_fk"
      FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    `);

    return NextResponse.json({
      success: true,
      message: 'Events table created successfully'
    });
  } catch (error) {
    console.error('Error creating events table:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create events table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
