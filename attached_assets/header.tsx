import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/shift-logs": "Shift Logs",
  "/templates": "Templates",
  "/incidents": "Incidents",
  "/reports": "Reports",
  "/team": "Team",
  "/settings": "Preferences"
};

interface HeaderProps {
  onMobileMenuClick: () => void;
  notificationCount?: number;
}

export default function Header({ onMobileMenuClick, notificationCount = 0 }: HeaderProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const pageTitle = pageTitles[location] || "Page Not Found";

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-neutral-dark hover:text-primary focus:outline-none"
          onClick={onMobileMenuClick}
        >
          <Menu size={24} />
        </button>
        
        {/* Page Title */}
        <div className="md:ml-0 font-medium text-xl text-neutral-dark">{pageTitle}</div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="w-64 pl-10 pr-4 py-2 rounded-md border border-neutral-light bg-neutral-lighter focus:outline-none focus:border-primary"
            />
            <Search className="text-neutral-medium absolute left-3 top-1/2 transform -translate-y-1/2" size={16} />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button className="text-neutral-dark hover:text-primary focus:outline-none">
              <div className="relative">
                <Bell size={20} />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </div>
            </button>
          </div>
          
          {/* New Log Button */}
          <Button size="sm" className="hidden sm:flex items-center gap-2">
            <Plus size={16} />
            <span>New Log</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
