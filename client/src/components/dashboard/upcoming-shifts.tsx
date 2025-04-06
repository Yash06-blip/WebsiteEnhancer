import { useShifts } from "@/hooks/use-shifts";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function UpcomingShifts() {
  const { upcomingShifts, isLoading, createShift, isPendingCreate } = useShifts();
  const { user } = useAuth();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  // For the assign shift form
  const [shiftType, setShiftType] = useState<"morning" | "evening" | "night">("morning");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleAssignShift = async () => {
    if (!user) return;
    
    await createShift({
      shiftType,
      startTime,
      endTime,
      users: selectedUsers,
    });
    
    // Reset form and close dialog
    setShiftType("morning");
    setStartTime("");
    setEndTime("");
    setSelectedUsers([]);
    setIsAssignDialogOpen(false);
  };

  // Helper function to format date and time
  const formatShiftTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Helper function to determine if a shift is today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Upcoming Shifts</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-3 w-3" />
                  Assign Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign New Shift</DialogTitle>
                  <DialogDescription>
                    Create a new shift assignment for personnel.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shift-type">Shift Type</Label>
                    <Select value={shiftType} onValueChange={(val: "morning" | "evening" | "night") => setShiftType(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input 
                        id="start-time" 
                        type="datetime-local" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input 
                        id="end-time" 
                        type="datetime-local" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="users">Assigned Users</Label>
                    <Input 
                      id="users" 
                      placeholder="User IDs (comma separated)" 
                      value={selectedUsers.join(',')} 
                      onChange={(e) => setSelectedUsers(e.target.value.split(',').map(id => id.trim()))} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Note: In a real application, this would be a user selection component
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignShift} 
                    disabled={!shiftType || !startTime || !endTime || !selectedUsers.length || isPendingCreate}
                  >
                    {isPendingCreate ? "Assigning..." : "Assign Shift"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm">
              View Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-[180px] w-full" />
              ))}
            </div>
          ) : upcomingShifts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No upcoming shifts scheduled. Use the "Assign Shift" button to create a new shift.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingShifts.map((shift) => (
                <Card key={shift.id}>
                  <div className="border-b p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium capitalize">{shift.shiftType} Shift</h3>
                      <Badge variant={isToday(shift.startTime) ? "default" : "secondary"} className="px-2 py-0.5 text-xs">
                        {isToday(shift.startTime) ? "Today" : "Tomorrow"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatShiftTime(shift.startTime, shift.endTime)}
                    </p>
                  </div>
                  <div className="p-3">
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Assigned Personnel</h4>
                    <div className="flex flex-wrap gap-2">
                      {shift.userDetails && shift.userDetails.map((user) => (
                        <div key={user.id} className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-primary/80 text-[10px] text-white">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.fullName}</span>
                        </div>
                      ))}
                      {!shift.userDetails || shift.userDetails.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No personnel assigned</p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
