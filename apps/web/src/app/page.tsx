"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/comp-586";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<Navbar />
			<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">Welcome to SynergySphere</h1>
				<p className="text-xl text-muted-foreground mb-8">
					Manage your projects and tasks with ease
				</p>
				<div className="flex gap-4 justify-center">
					<Button asChild size="lg">
						<Link href="/signup">Get Started</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/login">Sign In</Link>
					</Button>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Project Management</CardTitle>
						<CardDescription>
							Organize and track your projects with ease
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Create projects, set deadlines, and manage team members all in one place.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Task Tracking</CardTitle>
						<CardDescription>
							Stay on top of your tasks and deadlines
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Create, assign, and track tasks with detailed progress monitoring.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Team Collaboration</CardTitle>
						<CardDescription>
							Work together seamlessly with your team
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Share projects, assign tasks, and communicate effectively.
						</p>
					</CardContent>
				</Card>
			</div>
			</div>
		</div>
	);
}
