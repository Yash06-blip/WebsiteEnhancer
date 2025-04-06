import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ThumbsUp, AlertTriangle, Clock, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  pendingHandovers: number;
  requiresAttention: number;
  activeIncidents: number;
  highPriorityIncidents: number;
  completedToday: number;
  completedYesterday: number;
  openTasks: number;
  completionRate: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Pending Handovers</h3>
          </div>
          <p className="mt-3 text-2xl font-bold">{stats?.pendingHandovers || 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats && stats.completedToday > stats.completedYesterday ? (
              <span className="text-success">↑ {((stats.completedToday - stats.completedYesterday) / stats.completedYesterday * 100).toFixed(0)}%</span>
            ) : (
              <span className="text-destructive">↓ {((stats?.completedYesterday - stats?.completedToday) / stats?.completedYesterday * 100).toFixed(0)}%</span>
            )}{" "}
            from yesterday
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-medium text-muted-foreground">Active Incidents</h3>
          </div>
          <p className="mt-3 text-2xl font-bold">{stats?.activeIncidents || 0}</p>
          <div className="mt-1 flex items-center gap-1">
            {stats?.highPriorityIncidents ? (
              <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
                {stats.highPriorityIncidents} High
              </span>
            ) : null}
            {stats?.activeIncidents && stats.activeIncidents - (stats?.highPriorityIncidents || 0) > 0 ? (
              <span className="rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-medium text-black">
                {stats.activeIncidents - (stats?.highPriorityIncidents || 0)} Medium
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Shifts Today</h3>
          </div>
          <p className="mt-3 text-2xl font-bold">3</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span>Morning, Evening, Night</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Task Completion</h3>
          </div>
          <p className="mt-3 text-2xl font-bold">{stats?.completionRate || 0}%</p>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div 
              className="h-full rounded-full bg-success" 
              style={{ width: `${stats?.completionRate || 0}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
