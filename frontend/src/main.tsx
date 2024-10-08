import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Add this line
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import './index.css';

// Initialize the React Query client
const queryClient = new QueryClient(); // Add this line

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {' '}
      {/* Add this wrapper */}
      <App />
    </QueryClientProvider>
  </StrictMode>
);
