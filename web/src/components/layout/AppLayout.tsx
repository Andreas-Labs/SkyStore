import React from 'react';
import { AppShell } from '@mantine/core';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { LAYOUT } from '../../constants';

export function AppLayout() {
  return (
    <AppShell
      header={{ height: LAYOUT.header.height }}
      navbar={{ width: LAYOUT.navbar.width, breakpoint: LAYOUT.navbar.breakpoint }}
      padding="md"
    >
      <AppShell.Header>
        <TopNavbar />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
} 