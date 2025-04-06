import { Link, useRoute } from 'wouter';
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  LayoutTemplate,
  BarChart3,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/shift-logs", label: "Shift Logs", icon: <FileText className="h-5 w-5" /> },
    { href: "/incidents", label: "Incidents", icon: <AlertTriangle className="h-5 w-5" /> },
    { href: "/templates", label: "Templates", icon: <LayoutTemplate className="h-5 w-5" /> },
    { href: "/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/team", label: "Team", icon: <Users className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-border bg-sidebar text-sidebar-foreground lg:block">
      <div className="flex h-14 items-center border-b border-border/50 px-4">
        <h1 className="font-bold text-xl">MineShift Pro</h1>
      </div>
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>
      </div>
      <div className="absolute bottom-0 w-full border-t border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <span className="text-xs font-medium text-primary-foreground">{user?.initials}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-sidebar-foreground/70">
                {user?.role === 1 
                  ? 'Mining Manager' 
                  : user?.role === 2 
                    ? 'Mining Crew'
                    : user?.role === 3 
                      ? 'Operations Team'
                      : user?.role === 4
                        ? 'Drilling Specialist'
                        : user?.role === 5
                          ? 'Blasting Crew'
                          : 'Mining Crew'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="rounded-md p-2 text-sidebar-foreground/80 hover:bg-sidebar-foreground/10"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function NavItem({ href, label, icon }: NavItemProps) {
  const [isActive] = useRoute(href);
  
  return (
    <Link href={href}>
      <div
        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
          isActive 
            ? "bg-sidebar-foreground/10" 
            : "hover:bg-sidebar-foreground/10"
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
