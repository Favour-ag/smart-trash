
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

type DashboardLayoutProps = {
  role: 'admin' | 'resident';
  userName: string;
};

const DashboardLayout = ({ role, userName }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    // We'll implement actual logout later
    // For now, let's just navigate to the home page
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        user={{ name: userName, role }}
        onLogout={handleLogout}
        onMenuToggle={toggleSidebar}
      />
      
      <div className="flex flex-1">
        <Sidebar role={role} isOpen={!isMobile || sidebarOpen} onClose={closeSidebar} />
        
        <main className={`flex-1 ${!isMobile ? 'pl-64' : ''}`}>
          <div className="tw-container py-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile sidebar backdrop */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 z-10 bg-black/50"
            onClick={closeSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
