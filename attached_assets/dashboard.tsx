import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import StatCard from "@/components/dashboard/stats-card";
import HandoversTable from "@/components/dashboard/handovers-table";
import IncidentsCard from "@/components/dashboard/incidents-card";
import ShiftsCard from "@/components/dashboard/shifts-card";
import QuickActions from "@/components/dashboard/quick-actions";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  const [greeting, setGreeting] = useState("Good day");
  
  const { data: stats, isLoading: statsLoading } = useQuery<{
    pendingHandovers: number;
    requiresAttention: number;
    activeIncidents: number;
    highPriorityIncidents: number;
    completedToday: number;
    completedYesterday: number;
    openTasks: number;
    completionRate: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);
  
  const formattedDate = format(new Date(), "EEEE, MMMM d, yyyy");
  const notificationCount = (stats?.requiresAttention || 0) + (stats?.highPriorityIncidents || 0);

  return (
    <MainLayout notificationCount={notificationCount}>
      <Card className="mb-6">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-medium text-neutral-dark mb-2">
                {greeting}, {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-neutral-medium">Here's what's happening with your shift handovers today.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-neutral-lighter rounded-md px-4 py-2 inline-flex items-center">
                <Calendar size={16} className="text-neutral-medium mr-2" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Skeleton className="flex-shrink-0 w-12 h-12 rounded-full" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <div className="mt-4">
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Pending Handovers"
              value={stats?.pendingHandovers || 0}
              icon="pending"
              footer={
                <span className="text-warning font-medium">
                  <Calendar size={14} className="inline mr-1" /> {stats?.requiresAttention || 0} requires attention
                </span>
              }
            />
            <StatCard
              title="Active Incidents"
              value={stats?.activeIncidents || 0}
              icon="incident"
              trend={stats?.highPriorityIncidents ? "up" : undefined}
              trendValue={stats?.highPriorityIncidents ? `${stats.highPriorityIncidents} high priority` : undefined}
            />
            <StatCard
              title="Completed Today"
              value={stats?.completedToday || 0}
              icon="completed"
              trend={stats?.completedToday && stats.completedToday > (stats?.completedYesterday || 0) ? "up" : "down"}
              trendValue={`${Math.abs((stats?.completedToday || 0) - (stats?.completedYesterday || 0))} than yesterday`}
            />
            <StatCard
              title="Open Tasks"
              value={stats?.openTasks || 0}
              icon="tasks"
              progressValue={stats?.completionRate || 0}
            />
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HandoversTable />
        </div>
        <div className="space-y-6">
          <IncidentsCard />
          <ShiftsCard />
          <QuickActions />
        </div>
      </div>
    </MainLayout>
  );
}