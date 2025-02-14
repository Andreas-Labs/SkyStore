import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './Routes';
import { UserProvider } from './contexts/UserContext';
import { theme } from './theme';
import { QUERY_CONFIG } from './constants';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: QUERY_CONFIG,
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <BrowserRouter>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
} 