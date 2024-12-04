import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Add this line

import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';

import { MantineProvider } from '@mantine/core';

// Initialize the React Query client
const queryClient = new QueryClient(); // Add this line

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
