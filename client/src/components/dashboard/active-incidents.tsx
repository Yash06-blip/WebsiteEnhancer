import { useIncidents } from "@/hooks/use-incidents";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function ActiveIncidents() {
  const { activeIncidents, isLoading, resolveIncident, createIncident, isPendingCreate, isPendingResolve } = useIncidents();
  const { user } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  
  // For the report incident form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleReportIncident = async () => {
    if (!user) return;
    
    await createIncident({
      title,
      description,
      priority,
      reportedBy: user.id,
    });
    
    // Reset form and close dialog
    setTitle("");
    setDescription("");
    setPriority("medium");
    setIsReportDialogOpen(false);
  };

  const handleResolveIncident = async () => {
    if (!user || !selectedIncidentId) return;
    
    await resolveIncident({
      id: selectedIncidentId,
      resolvedBy: user.id,
    });
    
    setSelectedIncidentId(null);
    setIsResolveDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Active Incidents</CardTitle>
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Plus className="mr-1 h-3 w-3" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
                <DialogDescription>
                  Fill in the details below to report a new incident. All incidents are tracked and assigned for resolution.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Brief incident title" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(val: "low" | "medium" | "high") => setPriority(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Detailed description of the incident" 
                    rows={5} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReportIncident} 
                  disabled={!title || !description || isPendingCreate}
                >
                  {isPendingCreate ? "Submitting..." : "Submit Report"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-[100px] w-full" />
              ))}
            </div>
          ) : activeIncidents.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No active incidents at this time. Safety first!
            </p>
          ) : (
            <ScrollArea className="max-h-[294px]">
              <div className="space-y-3">
                {activeIncidents.map((incident) => (
                  <Card key={incident.id} className="border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={incident.priority} />
                          <h3 className="font-medium">{incident.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Reported by {incident.reporter?.fullName || "Unknown"} • {formatDate(incident.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="secondary" size="sm">
                          Update
                        </Button>
                        <Dialog open={isResolveDialogOpen && selectedIncidentId === incident.id} 
                                onOpenChange={(open) => {
                                  setIsResolveDialogOpen(open);
                                  if (!open) setSelectedIncidentId(null);
                                }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => setSelectedIncidentId(incident.id)}
                            >
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resolve Incident</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to mark this incident as resolved?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="text-sm font-medium">{incident.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{incident.description}</p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleResolveIncident} 
                                disabled={isPendingResolve}
                              >
                                {isPendingResolve ? "Resolving..." : "Confirm Resolution"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{incident.description}</p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "high":
      return (
        <Badge variant="outline" className="bg-destructive text-[10px] uppercase text-destructive-foreground">
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-warning text-[10px] uppercase text-warning-foreground">
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge variant="outline" className="bg-muted text-[10px] uppercase text-muted-foreground">
          Low
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-muted text-[10px] uppercase text-muted-foreground">
          {priority}
        </Badge>
      );
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    const hours = Math.floor(diffHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffHours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }
}
