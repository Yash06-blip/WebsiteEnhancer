import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChartIcon, 
  ClipboardListIcon, 
  FileIcon, 
  AlertCircleIcon, 
  BarChart4Icon, 
  UsersIcon, 
  SettingsIcon, 
  ShieldIcon, 
  HelpCircleIcon, 
  LogOutIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const NavItem = ({ href, icon, children, className }: NavItemProps) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <li className="mb-1">
      <Link href={href}>
        <a
          className={cn(
            "flex items-center px-4 py-2 rounded-md transition-colors",
            isActive 
              ? "text-primary bg-primary-light font-medium" 
              : "text-neutral-dark hover:bg-neutral-light",
            className
          )}
        >
          <span className="w-5 text-center mr-3">{icon}</span>
          <span>{children}</span>
        </a>
      </Link>
    </li>
  );
};

export default function Sidebar({ 
  mobileOpen = false, 
  onClose 
}: { 
  mobileOpen?: boolean; 
  onClose?: () => void; 
}) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "bg-white shadow-lg w-64 flex-shrink-0 hidden md:block transition-all duration-300 ease-in-out",
        mobileOpen && "block"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-neutral-light flex items-center">
            <div className="text-primary font-bold text-xl">ShiftSync</div>
            <div className="ml-2 px-2 bg-primary text-white text-xs rounded-md py-1">AI</div>
          </div>
          
          {/* User Profile */}
          <div className="px-6 py-4 border-b border-neutral-light">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <span>{user?.initials}</span>
              </div>
              <div className="ml-3">
                <div className="font-medium text-neutral-dark">{user?.fullName}</div>
                <div className="text-xs text-neutral-medium capitalize">{user?.role}</div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scroll-thin px-2 py-4">
            <ul>
              <NavItem href="/" icon={<BarChartIcon size={18} />}>
                Dashboard
              </NavItem>
              <NavItem href="/shift-logs" icon={<ClipboardListIcon size={18} />}>
                Shift Logs
              </NavItem>
              <NavItem href="/templates" icon={<FileIcon size={18} />}>
                Templates
              </NavItem>
              <NavItem href="/incidents" icon={<AlertCircleIcon size={18} />}>
                Incidents
              </NavItem>
              <NavItem href="/reports" icon={<BarChart4Icon size={18} />}>
                Reports
              </NavItem>
              <NavItem href="/team" icon={<UsersIcon size={18} />}>
                Team
              </NavItem>
              
              <li className="mt-6 mb-2">
                <div className="px-4 text-xs font-medium text-neutral-medium uppercase tracking-wider">
                  Settings
                </div>
              </li>
              <NavItem href="/settings" icon={<SettingsIcon size={18} />}>
                Preferences
              </NavItem>
              <NavItem href="/settings?tab=permissions" icon={<ShieldIcon size={18} />}>
                Permissions
              </NavItem>
              <NavItem href="/settings?tab=help" icon={<HelpCircleIcon size={18} />}>
                Help
              </NavItem>
            </ul>
          </nav>
          
          {/* Logout */}
          <div className="px-6 py-4 border-t border-neutral-light">
            <button 
              onClick={handleLogout}
              className="flex items-center text-neutral-medium hover:text-neutral-dark transition-colors w-full"
            >
              <LogOutIcon size={18} className="w-5 text-center mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-neutral-dark bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-neutral-light flex items-center">
            <div className="text-primary font-bold text-xl">ShiftSync</div>
            <div className="ml-2 px-2 bg-primary text-white text-xs rounded-md py-1">AI</div>
          </div>
          
          {/* User Profile */}
          <div className="px-6 py-4 border-b border-neutral-light">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <span>{user?.initials}</span>
              </div>
              <div className="ml-3">
                <div className="font-medium text-neutral-dark">{user?.fullName}</div>
                <div className="text-xs text-neutral-medium capitalize">{user?.role}</div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scroll-thin px-2 py-4">
            <ul>
              <NavItem href="/" icon={<BarChartIcon size={18} />}>
                Dashboard
              </NavItem>
              <NavItem href="/shift-logs" icon={<ClipboardListIcon size={18} />}>
                Shift Logs
              </NavItem>
              <NavItem href="/templates" icon={<FileIcon size={18} />}>
                Templates
              </NavItem>
              <NavItem href="/incidents" icon={<AlertCircleIcon size={18} />}>
                Incidents
              </NavItem>
              <NavItem href="/reports" icon={<BarChart4Icon size={18} />}>
                Reports
              </NavItem>
              <NavItem href="/team" icon={<UsersIcon size={18} />}>
                Team
              </NavItem>
              
              <li className="mt-6 mb-2">
                <div className="px-4 text-xs font-medium text-neutral-medium uppercase tracking-wider">
                  Settings
                </div>
              </li>
              <NavItem href="/settings" icon={<SettingsIcon size={18} />}>
                Preferences
              </NavItem>
              <NavItem href="/settings?tab=permissions" icon={<ShieldIcon size={18} />}>
                Permissions
              </NavItem>
              <NavItem href="/settings?tab=help" icon={<HelpCircleIcon size={18} />}>
                Help
              </NavItem>
            </ul>
          </nav>
          
          {/* Logout */}
          <div className="px-6 py-4 border-t border-neutral-light">
            <button 
              onClick={handleLogout}
              className="flex items-center text-neutral-medium hover:text-neutral-dark transition-colors w-full"
            >
              <LogOutIcon size={18} className="w-5 text-center mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
