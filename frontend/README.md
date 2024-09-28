# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

Using React Query for API Requests
The frontend has been enhanced to include React Query for making POST requests to the backend server. React Query provides efficient data fetching, caching, and synchronization of server data.

Installation
To install the required dependencies for React Query and Axios, run:

```
npm install @tanstack/react-query axios
```

Query Client Setup
The `QueryClientProvider` is initialized in the `src/main.tsx` file to provide React Query functionality across the application:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Initialize the React Query client
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

Custom Hook: `usePostWebsite`
We have created a custom React Query hook, `usePostWebsite`, to handle POST requests to the backend server.

The backend API endpoint for posting website data is: http://localhost:8000/api/generate-website.

Example Usage of `usePostWebsite`
This hook can be used to send a POST request with website details (such as title and scroll trigger) to the backend:

```tsx
import React, { useState } from 'react';
import { usePostWebsite } from './usePostWebsite';

const WebsiteForm = () => {
  const [title, setTitle] = useState('');
  const [scrollTrigger, setScrollTrigger] = useState(false);

  const mutation = usePostWebsite();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title, scroll_trigger: scrollTrigger });
  };

  return (
    <div>
      <h1>Create a Website</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter website title"
          />
        </div>
        <div>
          <label>Scroll Trigger: </label>
          <input
            type="checkbox"
            checked={scrollTrigger}
            onChange={(e) => setScrollTrigger(e.target.checked)}
          />
        </div>
        <button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Creating...' : 'Create Website'}
        </button>
      </form>
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Website created successfully!</p>}
    </div>
  );
};

export default WebsiteForm;
```

Running the Development Server
To start the development server, use:

```bash
npm run dev
```

This will start the application on http://localhost:3000.

Building for Production
To create a production build, run:

```bash
npm run build
```

The production files will be generated in the `dist/` directory.