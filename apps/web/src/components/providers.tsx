"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { RealtimeProvider } from "@/contexts/realtime-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { WebSocketProvider } from "@/contexts/websocket-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { api, apiClient } from "@/lib/api";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		},
	}));

	return (
		<QueryClientProvider client={queryClient}>
			<api.Provider client={apiClient}>
				<RealtimeProvider>
					<NotificationProvider>
						<WebSocketProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="system"
								enableSystem
								disableTransitionOnChange
							>
								{children}
								<Toaster richColors />
							</ThemeProvider>
						</WebSocketProvider>
					</NotificationProvider>
				</RealtimeProvider>
			</api.Provider>
		</QueryClientProvider>
	);
}
