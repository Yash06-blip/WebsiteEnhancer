import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import AIAssistant from "../ai-assistant";

interface MainLayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
}

export default function MainLayout({ children, notificationCount = 0 }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={closeMobileMenu} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuClick={toggleMobileMenu} notificationCount={notificationCount} />
        
        <main className="flex-1 overflow-y-auto scroll-thin p-4 sm:p-6 lg:p-8 bg-neutral-light">
          {children}
        </main>
      </div>
      
      <AIAssistant />
    </div>
  );
}
