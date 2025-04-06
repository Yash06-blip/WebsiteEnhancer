import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { RecentHandovers } from "@/components/dashboard/recent-handovers";
import { ActiveIncidents } from "@/components/dashboard/active-incidents";
import { UpcomingShifts } from "@/components/dashboard/upcoming-shifts";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { NewHandoverModal } from "@/components/handover/new-handover-modal";
import { SmartAnalysisToast } from "@/components/handover/smart-analysis-toast";

export default function Dashboard() {
  const [isNewHandoverModalOpen, setIsNewHandoverModalOpen] = useState(false);
  const [showAnalysisToast, setShowAnalysisToast] = useState(false);

  // Mock data for dashboard export
  const dashboardData = {
    summary: {
      date: new Date().toISOString().split('T')[0],
      totalHandovers: 25,
      completedHandovers: 18,
      pendingReview: 5,
      requiresAttention: 2,
      activeIncidents: 4,
      resolvedIncidents: 12,
      upcomingShifts: 8
    },
    stats: {
      safetyScore: 94,
      productionEfficiency: 88,
      equipmentReliability: 92,
      teamAttendance: 96
    }
  };

  // Function to handle exporting dashboard data
  const handleExportDashboard = () => {
    // Format current date for filename
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Convert data to JSON format
    const jsonData = JSON.stringify(dashboardData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-summary-${formattedDate}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsNewHandoverModalOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New Handover
              </Button>
              <Button variant="outline" onClick={handleExportDashboard}>
                <Download className="mr-1 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <StatsCards />
          <AiAssistant />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <RecentHandovers />
            <ActiveIncidents />
          </div>

          <UpcomingShifts />
        </main>
      </div>

      <NewHandoverModal 
        open={isNewHandoverModalOpen} 
        onOpenChange={setIsNewHandoverModalOpen} 
      />
      
      <SmartAnalysisToast 
        open={showAnalysisToast} 
        onClose={() => setShowAnalysisToast(false)} 
      />
    </div>
  );
}
