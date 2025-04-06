import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Incident {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  reportedBy: number;
  resolvedBy: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: number;
    fullName: string;
    initials: string;
  };
}

export interface CreateIncidentParams {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  reportedBy: number;
}

export interface ResolveIncidentParams {
  id: number;
  resolvedBy: number;
}

export function useIncidents() {
  const { toast } = useToast();

  const { data: activeIncidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ['/api/incidents/active'],
  });

  const createIncident = useMutation({
    mutationFn: async (params: CreateIncidentParams) => {
      const res = await apiRequest('POST', '/api/incidents', params);
      return await res.json() as Incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Incident reported",
        description: "Your incident has been reported successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error reporting incident",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resolveIncident = useMutation({
    mutationFn: async ({ id, resolvedBy }: ResolveIncidentParams) => {
      const res = await apiRequest('PATCH', `/api/incidents/${id}/resolve`, { resolvedBy });
      return await res.json() as Incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Incident resolved",
        description: "The incident has been marked as resolved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error resolving incident",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    activeIncidents,
    isLoading,
    createIncident: createIncident.mutateAsync,
    isPendingCreate: createIncident.isPending,
    resolveIncident: resolveIncident.mutateAsync,
    isPendingResolve: resolveIncident.isPending,
  };
}
