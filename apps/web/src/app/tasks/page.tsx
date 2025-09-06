"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckSquare, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useTasks, useDeleteTasks } from "@/hooks/use-tasks";
import { ProductSwapCard } from "@/components/shsfui/cards/product-swap-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

// Transform task data to match ProductData interface
const transformTaskToProduct = (task: any) => ({
	title: task.title,
	excerpt: task.description || "No description provided",
	createdAt: format(new Date(task.createdAt), "MMM dd, yyyy"),
	domain: "", // Not used anymore
	slug: task.id,
	status: task.status,
	priority: task.priority,
	deadline: task.deadline,
	alt: [
		`${task.title} task overview`,
		`${task.title} task details`,
	],
	techStack: task.tags || ["Task Management"],
	thumbnail: task.image
		? [task.image, task.image]
		: [
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=640&h=360&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=640&h=360&auto=format&fit=crop",
		],
	actionLabel: "", // Not used anymore
	assignee: task.assignee || null,
});

export default function TasksPage() {
	const { tasks, isLoading } = useTasks();
	const deleteTasksMutation = useDeleteTasks();
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleSelectAll = () => {
		if (selectedTasks.length === tasks?.length) {
			setSelectedTasks([]);
		} else {
			setSelectedTasks(tasks?.map(t => t.id) || []);
		}
	};

	const handleSelectTask = (taskId: string) => {
		setSelectedTasks(prev =>
			prev.includes(taskId)
				? prev.filter(id => id !== taskId)
				: [...prev, taskId]
		);
	};

	const handleEditTasks = () => {
		setIsEditMode(true);
		setSelectedTasks([]);
		toast.info('Edit mode enabled. Select tasks to delete.');
	};

	const handleDeleteTasks = () => {
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		try {
			await deleteTasksMutation.mutateAsync(selectedTasks);
			toast.success(`Successfully deleted ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}`);
			setShowDeleteDialog(false);
			setSelectedTasks([]);
			setIsEditMode(false);
		} catch (error) {
			console.error('Failed to delete tasks:', error);
			toast.error('Failed to delete tasks. Please try again.');
		}
	};

	const cancelEditMode = () => {
		setIsEditMode(false);
		setSelectedTasks([]);
	};

	return (
		<DashboardLayout>
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold">All Tasks</h1>
						<p className="text-muted-foreground">
							Track and manage all tasks in your projects
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleEditTasks}>
									<Edit className="mr-2 h-4 w-4" />
									Edit Tasks
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDeleteTasks} className="text-red-600">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Tasks
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button asChild>
							<Link href="/tasks/new">
								<Plus className="mr-2 h-4 w-4" />
								New Task
							</Link>
						</Button>
					</div>
				</div>

				{/* Edit Mode Controls */}
				{isEditMode && (
					<div className="mb-6 p-4 bg-muted/50 rounded-lg border">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<Checkbox
										checked={selectedTasks.length === tasks?.length && tasks?.length > 0}
										onCheckedChange={handleSelectAll}
									/>
									<label className="text-sm font-medium">
										Select All ({selectedTasks.length}/{tasks?.length || 0})
									</label>
								</div>
								{selectedTasks.length > 0 && (
									<Badge variant="secondary">
										{selectedTasks.length} selected
									</Badge>
								)}
							</div>
							<div className="flex items-center space-x-2">
								<Button variant="outline" onClick={cancelEditMode}>
									Cancel
								</Button>
								{selectedTasks.length > 0 && (
									<Button
										variant="destructive"
										onClick={handleDeleteTasks}
										disabled={selectedTasks.length === 0 || deleteTasksMutation.isPending}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										{deleteTasksMutation.isPending ? 'Deleting...' : 'Delete Selected'}
									</Button>
								)}
							</div>
						</div>
					</div>
				)}

				{isLoading ? (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-4 bg-muted rounded w-3/4"></div>
									<div className="h-3 bg-muted rounded w-1/2"></div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<div className="h-3 bg-muted rounded"></div>
										<div className="h-3 bg-muted rounded w-2/3"></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : tasks && tasks.length > 0 ? (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{tasks.map((task) => (
							<div key={task.id} className="relative">
								{isEditMode && (
									<div className="absolute top-2 left-2 z-10">
										<Checkbox
											checked={selectedTasks.includes(task.id)}
											onCheckedChange={() => handleSelectTask(task.id)}
										/>
									</div>
								)}
								<ProductSwapCard
									product={transformTaskToProduct(task)}
									className={`hover:shadow-lg transition-shadow ${isEditMode ? 'opacity-90' : ''}`}
								/>
							</div>
						))}
					</div>
				) : (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
							<p className="text-muted-foreground text-center mb-4">
								Create your first task to get started with task management
							</p>
							<Button asChild>
								<Link href="/tasks/new">
									<Plus className="mr-2 h-4 w-4" />
									Create Task
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Delete Confirmation Dialog */}
				<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Tasks</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''}?
								This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowDeleteDialog(false)}
								disabled={deleteTasksMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={confirmDelete}
								disabled={deleteTasksMutation.isPending}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								{deleteTasksMutation.isPending ? 'Deleting...' : `Delete ${selectedTasks.length} Task${selectedTasks.length > 1 ? 's' : ''}`}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}
