"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/sonner";
import SocketProvider from "@/providers/socketProvider";

function Providers({ children }: { children: React.ReactNode }) {
  // This component is used to wrap the application with providers
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // default: true
        staleTime: 30000,
      },
    },
  });
  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>{children}</SocketProvider>
      </QueryClientProvider>
      <Toaster />
    </React.Fragment>
  );
}

export default Providers;
