import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Handover {
  id: number;
  logNumber: string;
  userId: number;
  shift: 'morning' | 'evening' | 'night';
  type: 'statutory' | 'non-statutory';
  status: 'pending_review' | 'requires_attention' | 'completed';
  content: string;
  comments: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    initials: string;
  };
}

export interface CreateHandoverParams {
  shift: 'morning' | 'evening' | 'night';
  type: 'statutory' | 'non-statutory';
  content: string;
  userId: number;
}

export interface UpdateHandoverStatusParams {
  id: number;
  status: 'pending_review' | 'requires_attention' | 'completed';
  comments?: string;
  reviewedBy?: number;
}

export function useHandovers() {
  const { toast } = useToast();

  const { data: handovers = [], isLoading } = useQuery<Handover[]>({
    queryKey: ['/api/handovers'],
  });

  const createHandover = useMutation({
    mutationFn: async (params: CreateHandoverParams) => {
      const res = await apiRequest('POST', '/api/handovers', params);
      return await res.json() as Handover;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/handovers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Handover created",
        description: "Your handover log has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating handover",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateHandoverStatus = useMutation({
    mutationFn: async ({ id, status, comments, reviewedBy }: UpdateHandoverStatusParams) => {
      const res = await apiRequest('PATCH', `/api/handovers/${id}/status`, { 
        status, 
        comments, 
        reviewedBy 
      });
      return await res.json() as Handover;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/handovers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Status updated",
        description: "The handover status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    handovers,
    isLoading,
    createHandover: createHandover.mutateAsync,
    isPendingCreate: createHandover.isPending,
    updateHandoverStatus: updateHandoverStatus.mutateAsync,
    isPendingUpdate: updateHandoverStatus.isPending,
  };
}

export function useHandoverAiAnalysis(logId: number | null) {
  const { data: analysis, isLoading } = useQuery({
    queryKey: [`/api/ai-analysis/${logId}`],
    enabled: !!logId,
  });

  return {
    analysis,
    isLoading,
  };
}

export function useAiRecommendations() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/ai-recommendations'],
  });

  return {
    recommendations: recommendations?.recommendations || null,
    isLoading,
  };
}
