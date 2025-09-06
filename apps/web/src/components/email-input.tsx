"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
	label?: string;
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	className?: string;
}

export default function EmailInput({
	label = "Email",
	placeholder = "Enter your email",
	value,
	onChange,
	error,
	className = "",
}: EmailInputProps) {
	const id = useId();

	return (
		<div className={`*:not-first:mt-2 ${className}`}>
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				type="email"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={error ? "border-red-500" : ""}
			/>
			{error && (
				<p className="text-sm text-red-500 mt-1">{error}</p>
			)}
		</div>
	);
}
