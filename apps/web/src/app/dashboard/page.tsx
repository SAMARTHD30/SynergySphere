"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	createdAt: string;
}

export default function DashboardPage() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated
		const isAuthenticated = localStorage.getItem("isAuthenticated");
		const userData = localStorage.getItem("user");

		if (!isAuthenticated || !userData) {
			router.push("/login");
			return;
		}

		try {
			const parsedUser = JSON.parse(userData);
			setUser(parsedUser);
		} catch (error) {
			console.error("Error parsing user data:", error);
			router.push("/login");
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	const handleLogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("isAuthenticated");
		router.push("/");
	};

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
					<p className="text-muted-foreground">
						Here's what's happening with your projects today.
					</p>
				</div>
				<Button onClick={handleLogout} variant="outline">
					Logout
				</Button>
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
						<p className="text-2xl font-bold">0</p>
						<p className="text-sm text-muted-foreground">Active projects</p>
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
						<p className="text-2xl font-bold">0</p>
						<p className="text-sm text-muted-foreground">Pending tasks</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Your latest updates
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							No recent activity
						</p>
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
	);
}
