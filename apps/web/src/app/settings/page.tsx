"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { AvatarUpload } from "@/components/avatar-upload";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function SettingsPage() {
	const { data: session } = useSession();
	const [profileImage, setProfileImage] = useState<string | null>(session?.user?.image || null);

	const handleImageChange = (imageUrl: string) => {
		setProfileImage(imageUrl);
		// Here you would typically update the user's profile in the database
		// For now, we'll just update the local state
	};

	return (
		<DashboardLayout>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Settings</h1>
					<p className="text-muted-foreground">
						Manage your account settings and preferences
					</p>
				</div>

				<div className="space-y-6">
					{/* Profile Settings */}
					<Card>
						<CardHeader>
							<div className="flex items-center space-x-2">
								<User className="h-5 w-5" />
								<CardTitle>Profile Information</CardTitle>
							</div>
							<CardDescription>
								Update your personal information and profile picture
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Avatar Upload Section */}
							<div className="flex items-start gap-6">
								<AvatarUpload
									currentImage={profileImage}
									onImageChange={handleImageChange}
									size="lg"
								/>
								<div className="flex-1">
									<h3 className="text-lg font-medium mb-2">Profile Picture</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Upload a profile picture to personalize your account.
										Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="firstName">First Name</Label>
									<Input id="firstName" placeholder="Enter your first name" />
								</div>
								<div>
									<Label htmlFor="lastName">Last Name</Label>
									<Input id="lastName" placeholder="Enter your last name" />
								</div>
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" placeholder="Enter your email" />
							</div>
							<Button>Save Changes</Button>
						</CardContent>
					</Card>

					{/* Notification Settings */}
					<Card>
						<CardHeader>
							<div className="flex items-center space-x-2">
								<Bell className="h-5 w-5" />
								<CardTitle>Notifications</CardTitle>
							</div>
							<CardDescription>
								Configure your notification preferences
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Email Notifications</Label>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<input type="checkbox" id="taskUpdates" defaultChecked />
										<Label htmlFor="taskUpdates">Task updates and assignments</Label>
									</div>
									<div className="flex items-center space-x-2">
										<input type="checkbox" id="projectUpdates" defaultChecked />
										<Label htmlFor="projectUpdates">Project updates and changes</Label>
									</div>
									<div className="flex items-center space-x-2">
										<input type="checkbox" id="teamUpdates" />
										<Label htmlFor="teamUpdates">Team member activities</Label>
									</div>
								</div>
							</div>
							<Button>Save Preferences</Button>
						</CardContent>
					</Card>

					{/* Security Settings */}
					<Card>
						<CardHeader>
							<div className="flex items-center space-x-2">
								<Shield className="h-5 w-5" />
								<CardTitle>Security</CardTitle>
							</div>
							<CardDescription>
								Manage your account security
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="currentPassword">Current Password</Label>
								<Input id="currentPassword" type="password" placeholder="Enter current password" />
							</div>
							<div>
								<Label htmlFor="newPassword">New Password</Label>
								<Input id="newPassword" type="password" placeholder="Enter new password" />
							</div>
							<div>
								<Label htmlFor="confirmPassword">Confirm New Password</Label>
								<Input id="confirmPassword" type="password" placeholder="Confirm new password" />
							</div>
							<Button>Change Password</Button>
						</CardContent>
					</Card>

					{/* Appearance Settings */}
					<Card>
						<CardHeader>
							<div className="flex items-center space-x-2">
								<Palette className="h-5 w-5" />
								<CardTitle>Appearance</CardTitle>
							</div>
							<CardDescription>
								Customize the look and feel of your workspace
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Theme</Label>
								<div className="space-y-2 mt-2">
									<div className="flex items-center space-x-2">
										<input type="radio" id="light" name="theme" value="light" />
										<Label htmlFor="light">Light</Label>
									</div>
									<div className="flex items-center space-x-2">
										<input type="radio" id="dark" name="theme" value="dark" />
										<Label htmlFor="dark">Dark</Label>
									</div>
									<div className="flex items-center space-x-2">
										<input type="radio" id="system" name="theme" value="system" defaultChecked />
										<Label htmlFor="system">System</Label>
									</div>
								</div>
							</div>
							<Button>Save Preferences</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}
