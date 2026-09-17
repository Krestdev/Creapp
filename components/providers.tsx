"use client";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/sonner";
import SocketProvider from "@/providers/socketProvider";

function Providers({ children }: { children: React.ReactNode }) {
  // This component is used to wrap the application with providers
  // useState ensures a single QueryClient instance per component lifetime (not recreated on re-renders)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30000,
            refetchOnMount: true, // refetch si les données sont stale lors du montage d'une page
          },
        },
      }),
  );
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
