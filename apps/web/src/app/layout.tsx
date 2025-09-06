import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import AuthSessionProvider from "@/components/session-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "SynergySphere",
	description: "SynergySphere - Project Management Platform",
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon/favicon-96x96.png',
		apple: '/favicon/apple-touch-icon.png',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthSessionProvider>
					<Providers>
						{children}
					</Providers>
				</AuthSessionProvider>
			</body>
		</html>
	);
}
