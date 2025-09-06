"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Navbar from "@/components/comp-586";
import EmailInput from "@/components/email-input";
import PasswordInputWithStrength from "@/components/password-input-with-strength";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			// Mock authentication - check if user exists in localStorage
			const storedUser = localStorage.getItem("user");
			if (storedUser) {
				const user = JSON.parse(storedUser);
				if (user.email === formData.email) {
					localStorage.setItem("isAuthenticated", "true");
					window.location.href = "/dashboard";
					return;
				}
			}
			setErrors({ email: "Invalid email or password" });
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<Navbar />
			<div className="flex items-center justify-center p-4 pt-8">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
						<CardDescription>
							Sign in to your SynergySphere account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<EmailInput
								label="Email"
								placeholder="Enter your email"
								value={formData.email}
								onChange={(value) => handleInputChange("email", value)}
								error={errors.email}
							/>

							<PasswordInputWithStrength
								label="Password"
								placeholder="Enter your password"
								value={formData.password}
								onChange={(value) => handleInputChange("password", value)}
								error={errors.password}
								showStrengthIndicator={false}
							/>

							<div className="flex items-center justify-between">
								<Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
									Forgot Password?
								</Link>
							</div>

							<Button type="submit" className="w-full">
								Sign In
							</Button>

							<div className="text-center text-sm">
								Don't have an account?{" "}
								<Link href="/signup" className="text-blue-600 hover:underline">
									Sign up
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
