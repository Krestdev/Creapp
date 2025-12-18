'use client';
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './ui/sonner';

function Providers({children}:{children : React.ReactNode}) {
  // This component is used to wrap the application with providers
  const queryClient = new QueryClient({
    defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      staleTime: 30000
    },
  },
  });
  return (
    <React.Fragment>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
        <Toaster/>
    </React.Fragment>
  )
}

export default Providers