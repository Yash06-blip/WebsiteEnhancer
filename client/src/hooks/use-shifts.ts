import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Shift {
  id: number;
  shiftType: 'morning' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  users: string[];
  userDetails?: {
    id: number;
    fullName: string;
    initials: string;
  }[];
}

export interface CreateShiftParams {
  shiftType: 'morning' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  users: string[];
}

export function useShifts() {
  const { toast } = useToast();

  const { data: upcomingShifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ['/api/shifts/upcoming'],
  });

  const createShift = useMutation({
    mutationFn: async (params: CreateShiftParams) => {
      const res = await apiRequest('POST', '/api/shifts', params);
      return await res.json() as Shift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/upcoming'] });
      toast({
        title: "Shift created",
        description: "The shift has been scheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating shift",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    upcomingShifts,
    isLoading,
    createShift: createShift.mutateAsync,
    isPendingCreate: createShift.isPending,
  };
}
