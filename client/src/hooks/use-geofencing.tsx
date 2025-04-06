import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GeofenceZone } from "@shared/schema";

export function useGeofencing() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get all geofence zones
  const {
    data: geofenceZones,
    isLoading: isLoadingZones,
    error: zonesError,
  } = useQuery({
    queryKey: ["/api/geofence-zones"],
    staleTime: 30000, // 30 seconds
  });

  // Get current attendance for all users
  const {
    data: attendance,
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useQuery({
    queryKey: ["/api/attendance"],
    staleTime: 10000, // 10 seconds
  });

  // Create a new geofence zone
  const createZoneMutation = useMutation({
    mutationFn: async (newZone: Omit<GeofenceZone, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/geofence-zones", newZone);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/geofence-zones"] });
      toast({
        title: "Geofence zone created",
        description: "The geofence zone has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create geofence zone",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing geofence zone
  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GeofenceZone> }) => {
      const res = await apiRequest("PATCH", `/api/geofence-zones/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/geofence-zones"] });
      toast({
        title: "Geofence zone updated",
        description: "The geofence zone has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update geofence zone",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a geofence zone
  const deleteZoneMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/geofence-zones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/geofence-zones"] });
      toast({
        title: "Geofence zone deleted",
        description: "The geofence zone has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete geofence zone",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record attendance
  const checkInMutation = useMutation({
    mutationFn: async (data: { coordinates: string; location: string }) => {
      const res = await apiRequest("POST", "/api/attendance/check-in", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Checked in",
        description: "Your attendance has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to check in",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record checkout
  const checkOutMutation = useMutation({
    mutationFn: async (data: { coordinates: string }) => {
      const res = await apiRequest("POST", "/api/attendance/check-out", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Checked out",
        description: "Your checkout has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to check out",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get the user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: `Failed to get your location: ${error.message}`,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
    }
  };

  // Check if a user is in a geofence zone
  const checkUserInZone = async (coordinates: string) => {
    try {
      const res = await apiRequest("POST", "/api/attendance/check-zone", { coordinates });
      const result = await res.json();
      return result.inZone;
    } catch (error) {
      toast({
        title: "Failed to check zone",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    geofenceZones,
    isLoadingZones,
    zonesError,
    attendance,
    isLoadingAttendance,
    attendanceError,
    currentLocation,
    getCurrentLocation,
    createZoneMutation,
    updateZoneMutation,
    deleteZoneMutation,
    checkInMutation,
    checkOutMutation,
    checkUserInZone,
  };
}