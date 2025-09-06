"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Navbar from "@/components/comp-586";
import EmailInput from "@/components/email-input";
import PasswordInputWithStrength from "@/components/password-input-with-strength";

export default function SignUpPage() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		termsAccepted: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = "First name is required";
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = "Last name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters long";
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!formData.termsAccepted) {
			newErrors.termsAccepted = "You must accept the terms and conditions";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			try {
				const response = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						firstName: formData.firstName,
						lastName: formData.lastName,
						email: formData.email,
						password: formData.password,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					// Redirect to login page after successful signup
					window.location.href = "/login?message=Account created successfully. Please sign in.";
				} else {
					setErrors({ email: data.error || "An error occurred during signup" });
				}
			} catch (error) {
				console.error("Signup error:", error);
				setErrors({ email: "An error occurred during signup" });
			}
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<Navbar />
			<div className="flex items-center justify-center p-4 pt-8">
				<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Create Account</CardTitle>
					<CardDescription>
						Join SynergySphere to manage your projects and tasks
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									type="text"
									value={formData.firstName}
									onChange={(e) => handleInputChange("firstName", e.target.value)}
									className={errors.firstName ? "border-red-500" : ""}
								/>
								{errors.firstName && (
									<p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
								)}
							</div>
							<div>
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									type="text"
									value={formData.lastName}
									onChange={(e) => handleInputChange("lastName", e.target.value)}
									className={errors.lastName ? "border-red-500" : ""}
								/>
								{errors.lastName && (
									<p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
								)}
							</div>
						</div>

						<EmailInput
							label="Email"
							placeholder="Enter your email"
							value={formData.email}
							onChange={(value) => handleInputChange("email", value)}
							error={errors.email}
						/>

						<PasswordInputWithStrength
							label="Password"
							placeholder="Create a password"
							value={formData.password}
							onChange={(value) => handleInputChange("password", value)}
							error={errors.password}
							showStrengthIndicator={true}
						/>

						<div>
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={formData.confirmPassword}
								onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
								className={errors.confirmPassword ? "border-red-500" : ""}
								placeholder="Confirm your password"
							/>
							{errors.confirmPassword && (
								<p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
							)}
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="terms"
								checked={formData.termsAccepted}
								onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
							/>
							<Label htmlFor="terms" className="text-sm">
								I agree to the{" "}
								<Link href="/terms" className="text-blue-600 hover:underline">
									Terms and Conditions
								</Link>
							</Label>
						</div>
						{errors.termsAccepted && (
							<p className="text-sm text-red-500">{errors.termsAccepted}</p>
						)}

						<Button type="submit" className="w-full">
							Create Account
						</Button>

						<div className="text-center text-sm">
							Already have an account?{" "}
							<Link href="/login" className="text-blue-600 hover:underline">
								Sign in
							</Link>
						</div>
					</form>
				</CardContent>
				</Card>
			</div>
		</div>
	);
}
