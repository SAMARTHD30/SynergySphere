"use client";
import Link from "next/link";
import { ThemeSwitcherWrapper } from "./theme-switcher-wrapper";

export default function Header() {
	const links = [{ to: "/", label: "Home" }] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ThemeSwitcherWrapper />
				</div>
			</div>
			<hr />
		</div>
	);
}
