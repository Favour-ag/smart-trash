
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type HeaderProps = {
  user?: {
    name: string;
    role: 'admin' | 'resident';
  } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onMenuToggle?: () => void;
};

const Header = ({ user, onLogin, onLogout, onMenuToggle }: HeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="tw-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && user && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
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
        
        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to={`/${user.role}/profile`}>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLogin} className="bg-tw-green-600 hover:bg-tw-green-700">Login</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
