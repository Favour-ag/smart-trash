
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  ChartBar,
  Users,
  Settings,
  User,
  Archive,
  Home,
  CreditCard
} from 'lucide-react';

type SidebarProps = {
  role: 'admin' | 'resident';
  isOpen?: boolean;
  onClose?: () => void;
};

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
  { path: '/admin/schedules', label: 'Manage Schedules', icon: <Calendar className="mr-2 h-5 w-5" /> },
  { path: '/admin/collections', label: 'Collections', icon: <Archive className="mr-2 h-5 w-5" /> },
  { path: '/admin/residents', label: 'Residents', icon: <Home className="mr-2 h-5 w-5" /> },
  { path: '/admin/feedback', label: 'Feedback', icon: <MessageSquare className="mr-2 h-5 w-5" /> },
  { path: '/admin/analytics', label: 'Analytics', icon: <ChartBar className="mr-2 h-5 w-5" /> },
  { path: '/admin/users', label: 'Manage Users', icon: <Users className="mr-2 h-5 w-5" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="mr-2 h-5 w-5" /> },
];

const residentNavItems = [
  { path: '/resident', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
  { path: '/resident/schedule', label: 'My Schedule', icon: <Calendar className="mr-2 h-5 w-5" /> },
  { path: '/resident/payments', label: 'Payments', icon: <CreditCard className="mr-2 h-5 w-5" /> },
  { path: '/resident/feedback', label: 'Submit Feedback', icon: <MessageSquare className="mr-2 h-5 w-5" /> },
  { path: '/resident/profile', label: 'My Profile', icon: <User className="mr-2 h-5 w-5" /> },
  { path: '/resident/settings', label: 'Settings', icon: <Settings className="mr-2 h-5 w-5" /> },
];

const Sidebar = ({ role, isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();
  const navItems = role === 'admin' ? adminNavItems : residentNavItems;

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-white transition-transform lg:translate-x-0 lg:border-r",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-tw-green-600 text-white rounded-full p-1.5 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-tw-green-700">TrashWise</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === item.path
                  ? "bg-tw-green-50 text-tw-green-700"
                  : "text-gray-500 hover:bg-gray-100"
              )}
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
