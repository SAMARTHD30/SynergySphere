"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, CheckSquare, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useProjects } from "@/hooks/use-projects";
import { useMyTasks } from "@/hooks/use-tasks";
import Link from "next/link";

export default function DashboardPage() {
	const { projects, isLoading: projectsLoading } = useProjects();
	const { tasks: myTasks, isLoading: tasksLoading } = useMyTasks();

	const activeProjects = projects.filter(p => p.status === 'active').length;
	const completedTasks = myTasks.filter(t => t.status === 'completed').length;
	const pendingTasks = myTasks.filter(t => t.status !== 'completed').length;

	return (
		<DashboardLayout>
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Welcome back!</h1>
					<p className="text-muted-foreground">
						Here's what's happening with your projects today.
					</p>
				</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>My Projects</CardTitle>
						<CardDescription>
							Manage your active projects
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{projectsLoading ? "..." : activeProjects}</p>
						<p className="text-sm text-muted-foreground">Active projects</p>
						<Button asChild className="mt-4" size="sm">
							<Link href="/projects">
								<FolderOpen className="mr-2 h-4 w-4" />
								View Projects
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>My Tasks</CardTitle>
						<CardDescription>
							Track your assigned tasks
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{tasksLoading ? "..." : pendingTasks}</p>
						<p className="text-sm text-muted-foreground">Pending tasks</p>
						<Button asChild className="mt-4" size="sm">
							<Link href="/tasks">
								<CheckSquare className="mr-2 h-4 w-4" />
								View Tasks
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Completed Tasks</CardTitle>
						<CardDescription>
							Tasks completed this week
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{tasksLoading ? "..." : completedTasks}</p>
						<p className="text-sm text-muted-foreground">Completed tasks</p>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8">
				<Card>
					<CardHeader>
						<CardTitle>Getting Started</CardTitle>
						<CardDescription>
							Set up your workspace
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
									<span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
								</div>
								<div>
									<h3 className="font-semibold">Create your first project</h3>
									<p className="text-sm text-muted-foreground">
										Start by creating a new project to organize your work
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
									<span className="text-gray-600 dark:text-gray-400 font-semibold">2</span>
								</div>
								<div>
									<h3 className="font-semibold">Add team members</h3>
									<p className="text-sm text-muted-foreground">
										Invite your team to collaborate on projects
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
									<span className="text-gray-600 dark:text-gray-400 font-semibold">3</span>
								</div>
								<div>
									<h3 className="font-semibold">Create tasks</h3>
									<p className="text-sm text-muted-foreground">
										Break down your projects into manageable tasks
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			</div>
		</DashboardLayout>
	);
}
