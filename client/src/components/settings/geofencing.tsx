import { useState, useEffect } from "react";
import { useGeofencing } from "@/hooks/use-geofencing";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { Loader2, Plus, Edit, Trash, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function GeofencingSettings() {
  const { user } = useAuth();
  const {
    geofenceZones,
    isLoadingZones,
    attendance,
    isLoadingAttendance,
    currentLocation,
    getCurrentLocation,
    createZoneMutation,
    updateZoneMutation,
    deleteZoneMutation,
    checkInMutation,
    checkOutMutation,
  } = useGeofencing();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coordinates: "",
    radius: 100,
    isActive: true,
  });

  const isManager = user?.role === 1; // Manager role is 1
  const formattedCoordinates = currentLocation 
    ? `${currentLocation.lat.toFixed(6)},${currentLocation.lng.toFixed(6)}` 
    : "";

  useEffect(() => {
    // If editing a zone, populate the form
    if (selectedZone && isEditDialogOpen) {
      setFormData({
        name: selectedZone.name,
        description: selectedZone.description || "",
        coordinates: selectedZone.coordinates,
        radius: selectedZone.radius || 100,
        isActive: selectedZone.isActive,
      });
    }
  }, [selectedZone, isEditDialogOpen]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createZoneMutation.mutate({
      name: formData.name,
      description: formData.description || null,
      coordinates: formData.coordinates,
      radius: parseInt(formData.radius) || 100,
      createdBy: user.id,
      isActive: formData.isActive,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateZoneMutation.mutate({
      id: selectedZone.id,
      data: {
        name: formData.name,
        description: formData.description || null,
        coordinates: formData.coordinates,
        radius: parseInt(formData.radius) || 100,
        isActive: formData.isActive,
      },
    });
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    deleteZoneMutation.mutate(selectedZone.id);
    setIsDeleteDialogOpen(false);
    setSelectedZone(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      coordinates: "",
      radius: 100,
      isActive: true,
    });
    setSelectedZone(null);
  };

  const handleCheckIn = () => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }
    
    checkInMutation.mutate({
      coordinates: formattedCoordinates,
      location: "Current Location", // This would be replaced by actual location name
    });
  };

  const handleCheckOut = () => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }
    
    checkOutMutation.mutate({
      coordinates: formattedCoordinates,
    });
  };

  // Check if the user has already checked in
  const userCheckedIn = attendance?.some(record => 
    record.userId === user?.id && !record.checkOutTime
  );

  // Get all users currently in a zone
  const getUsersInZone = (zoneId) => {
    if (!attendance) return [];
    
    return attendance.filter(record => 
      record.zoneId === zoneId && !record.checkOutTime
    );
  };

  if (isLoadingZones || isLoadingAttendance) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Geofencing</h2>
          <p className="text-sm text-muted-foreground">
            Manage geofence zones and track attendance
          </p>
        </div>
        
        {isManager && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Zone
          </Button>
        )}
      </div>

      {/* Current location and check-in/out card */}
      <Card>
        <CardHeader>
          <CardTitle>My Location</CardTitle>
          <CardDescription>View your current location and check in/out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Coordinates:</p>
              <p className="text-sm text-muted-foreground">
                {currentLocation 
                  ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` 
                  : "Location not available"}
              </p>
            </div>
            <Button variant="outline" onClick={getCurrentLocation}>
              <MapPin className="mr-2 h-4 w-4" />
              Get Location
            </Button>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {!userCheckedIn ? (
              <Button 
                onClick={handleCheckIn} 
                disabled={!currentLocation || checkInMutation.isPending}
              >
                {checkInMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check In
              </Button>
            ) : (
              <Button 
                onClick={handleCheckOut} 
                disabled={!currentLocation || checkOutMutation.isPending}
                variant="outline"
              >
                {checkOutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Geofence zones table */}
      <Card>
        <CardHeader>
          <CardTitle>Geofence Zones</CardTitle>
          <CardDescription>All defined zones and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {geofenceZones?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Radius (m)</TableHead>
                  <TableHead>Users Present</TableHead>
                  {isManager && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {geofenceZones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell>
                      {zone.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{zone.radius || 100} m</TableCell>
                    <TableCell>
                      {getUsersInZone(zone.id).length > 0 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {getUsersInZone(zone.id).length} users
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">No users</span>
                      )}
                    </TableCell>
                    {isManager && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedZone(zone);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedZone(zone);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No geofence zones defined yet.</p>
              {isManager && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add your first zone
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Zone Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Geofence Zone</DialogTitle>
            <DialogDescription>
              Add a new geofence zone to track attendance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Zone Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coordinates">Coordinates</Label>
                <div className="flex gap-2">
                  <Input
                    id="coordinates"
                    value={formData.coordinates}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    placeholder="latitude,longitude"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      getCurrentLocation();
                      if (currentLocation) {
                        setFormData({
                          ...formData,
                          coordinates: formattedCoordinates,
                        });
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Format: latitude,longitude (e.g., 37.7749,-122.4194)</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="radius">Radius (meters)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createZoneMutation.isPending}>
                {createZoneMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Zone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Geofence Zone</DialogTitle>
            <DialogDescription>
              Modify the selected geofence zone.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Zone Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-coordinates">Coordinates</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-coordinates"
                    value={formData.coordinates}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    placeholder="latitude,longitude"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      getCurrentLocation();
                      if (currentLocation) {
                        setFormData({
                          ...formData,
                          coordinates: formattedCoordinates,
                        });
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Format: latitude,longitude (e.g., 37.7749,-122.4194)</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-radius">Radius (meters)</Label>
                <Input
                  id="edit-radius"
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateZoneMutation.isPending}>
                {updateZoneMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Geofence Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this geofence zone? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {deleteZoneMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}