"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Edit, MoreHorizontal, Trash2, CheckSquare } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useProjects, useDeleteProjects } from "@/hooks/use-projects";
import { ProductSwapCard } from "@/components/shsfui/cards/product-swap-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

// Transform project data to match ProductData interface
const transformProjectToProduct = (project: any) => ({
	title: project.name,
	excerpt: project.description || "No description provided",
	createdAt: format(new Date(project.createdAt), "MMM dd, yyyy"),
	domain: "", // Not used anymore
	slug: project.id,
	status: project.status,
	priority: project.priority,
	deadline: project.deadline,
	alt: [
		`${project.name} project overview`,
		`${project.name} project details`,
	],
	techStack: project.tags || ["Project Management"],
	thumbnail: project.image
		? [project.image, project.image]
		: [
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=640&h=360&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=640&h=360&auto=format&fit=crop",
		],
	actionLabel: "", // Not used anymore
	projectManager: project.projectManager || null,
});

export default function ProjectsPage() {
	const { projects, isLoading } = useProjects();
	const deleteProjectsMutation = useDeleteProjects();
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleSelectAll = () => {
		if (selectedProjects.length === projects?.length) {
			setSelectedProjects([]);
		} else {
			setSelectedProjects(projects?.map(p => p.id) || []);
		}
	};

	const handleSelectProject = (projectId: string) => {
		setSelectedProjects(prev =>
			prev.includes(projectId)
				? prev.filter(id => id !== projectId)
				: [...prev, projectId]
		);
	};

	const handleEditProjects = () => {
		setIsEditMode(true);
		setSelectedProjects([]);
		toast.info('Edit mode enabled. Select projects to delete.');
	};

	const handleDeleteProjects = () => {
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		try {
			await deleteProjectsMutation.mutateAsync(selectedProjects);
			toast.success(`Successfully deleted ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''}`);
			setShowDeleteDialog(false);
			setSelectedProjects([]);
			setIsEditMode(false);
		} catch (error) {
			console.error('Failed to delete projects:', error);
			toast.error('Failed to delete projects. Please try again.');
		}
	};

	const cancelEditMode = () => {
		setIsEditMode(false);
		setSelectedProjects([]);
	};

	return (
		<DashboardLayout>
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold">Projects</h1>
						<p className="text-muted-foreground">
							Manage and organize your projects
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
								<DropdownMenuItem onClick={handleEditProjects}>
									<Edit className="mr-2 h-4 w-4" />
									Edit Projects
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDeleteProjects} className="text-red-600">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Projects
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button asChild>
							<Link href="/projects/new">
								<Plus className="mr-2 h-4 w-4" />
								New Project
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
										checked={selectedProjects.length === projects?.length && projects?.length > 0}
										onCheckedChange={handleSelectAll}
									/>
									<label className="text-sm font-medium">
										Select All ({selectedProjects.length}/{projects?.length || 0})
									</label>
								</div>
								{selectedProjects.length > 0 && (
									<Badge variant="secondary">
										{selectedProjects.length} selected
									</Badge>
								)}
							</div>
							<div className="flex items-center space-x-2">
								<Button variant="outline" onClick={cancelEditMode}>
									Cancel
								</Button>
								{selectedProjects.length > 0 && (
									<Button
										variant="destructive"
										onClick={handleDeleteProjects}
										disabled={selectedProjects.length === 0 || deleteProjectsMutation.isPending}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										{deleteProjectsMutation.isPending ? 'Deleting...' : 'Delete Selected'}
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
				) : projects && projects.length > 0 ? (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{projects.map((project) => (
							<div key={project.id} className="relative">
								{isEditMode && (
									<div className="absolute top-2 left-2 z-10">
										<Checkbox
											checked={selectedProjects.includes(project.id)}
											onCheckedChange={() => handleSelectProject(project.id)}
										/>
									</div>
								)}
								<ProductSwapCard
									product={transformProjectToProduct(project)}
									className={`hover:shadow-lg transition-shadow ${isEditMode ? 'opacity-90' : ''}`}
								/>
							</div>
						))}
					</div>
				) : (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No projects yet</h3>
							<p className="text-muted-foreground text-center mb-4">
								Create your first project to get started with project management
							</p>
							<Button asChild>
								<Link href="/projects/new">
									<Plus className="mr-2 h-4 w-4" />
									Create Project
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Delete Confirmation Dialog */}
				<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Projects</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''}?
								This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowDeleteDialog(false)}
								disabled={deleteProjectsMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={confirmDelete}
								disabled={deleteProjectsMutation.isPending}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								{deleteProjectsMutation.isPending ? 'Deleting...' : `Delete ${selectedProjects.length} Project${selectedProjects.length > 1 ? 's' : ''}`}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}
