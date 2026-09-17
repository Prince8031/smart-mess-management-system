import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
      <div className="flex flex-1 w-full">
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
