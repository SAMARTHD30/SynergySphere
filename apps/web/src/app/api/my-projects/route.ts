import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { db } from '@/lib/db';
import { projects, projectMembers } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's projects
    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        priority: projects.priority,
        status: projects.status,
        deadline: projects.deadline,
        tags: projects.tags,
        role: projectMembers.role,
      })
      .from(projects)
      .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        projects: userProjects,
        count: userProjects.length
      }
    });

  } catch (error) {
    console.error('Get my projects error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
