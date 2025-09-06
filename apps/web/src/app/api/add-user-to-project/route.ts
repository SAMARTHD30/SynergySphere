import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { db } from '@/lib/db';
import { projects, projectMembers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const { projectId, role = 'member' } = await request.json();

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 });
    }

    // Check if project exists
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

    if (!project[0]) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    // Add user to project
    try {
      await db.insert(projectMembers).values({
        projectId: projectId,
        userId: session.user.id,
        role: role,
      });

      return NextResponse.json({
        success: true,
        message: `Added user ${session.user.id} to project ${projectId} as ${role}`,
        data: {
          userId: session.user.id,
          projectId: projectId,
          role: role,
          projectName: project[0].name
        }
      });
    } catch (error) {
      // If it's a duplicate key error, that's okay
      if (error instanceof Error && error.message.includes('duplicate')) {
        return NextResponse.json({
          success: true,
          message: 'User is already a member of this project',
          data: {
            userId: session.user.id,
            projectId: projectId,
            role: role,
            projectName: project[0].name
          }
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Add user to project error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
