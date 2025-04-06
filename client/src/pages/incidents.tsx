import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useIncidents } from "@/hooks/use-incidents";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Filter, 
  Info, 
  AlertCircle 
} from "lucide-react";

export default function Incidents() {
  const { activeIncidents, isLoading, createIncident, resolveIncident } = useIncidents();
  const { user } = useAuth();
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  
  // Filter states
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleResolveIncident = async (id: number) => {
    if (!user) return;
    
    await resolveIncident({
      id,
      resolvedBy: user.id,
    });
  };

  const handleViewIncident = (incident: any) => {
    setSelectedIncident(incident);
    setIsViewDialogOpen(true);
  };

  // Filter incidents based on search and priority
  const filteredIncidents = activeIncidents.filter(incident => {
    const matchesPriority = filterPriority === "all" || incident.priority === filterPriority;
    const matchesSearch = 
      searchTerm === "" || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.reporter?.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
            <Button onClick={() => setIsReportDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Report Incident
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Incident Summary</CardTitle>
              <CardDescription>Overview of active incidents by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-destructive/10">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="mx-auto mb-2 h-6 w-6 text-destructive" />
                    <h3 className="font-medium">High Priority</h3>
                    <p className="text-2xl font-bold">
                      {activeIncidents.filter(i => i.priority === "high").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/10">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-warning" />
                    <h3 className="font-medium">Medium Priority</h3>
                    <p className="text-2xl font-bold">
                      {activeIncidents.filter(i => i.priority === "medium").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardContent className="p-4 text-center">
                    <Info className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <h3 className="font-medium">Low Priority</h3>
                    <p className="text-2xl font-bold">
                      {activeIncidents.filter(i => i.priority === "low").length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter and search through incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="mb-2 block">Search</Label>
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="Search by title, description, or reporter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priority-filter" className="mb-2 block">Priority</Label>
                  <Select
                    value={filterPriority}
                    onValueChange={setFilterPriority}
                  >
                    <SelectTrigger id="priority-filter" className="w-[180px]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Active Incidents</CardTitle>
              <CardDescription>List of all currently active incidents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center">
                  <CheckCircle className="mb-2 h-10 w-10 text-success" />
                  <h3 className="text-lg font-medium">No active incidents</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterPriority !== "all"
                      ? "Try adjusting your filters"
                      : "All incidents have been resolved"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reported At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {incident.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {incident.priority === "high" ? (
                            <Badge variant="outline" className="bg-destructive text-destructive-foreground">
                              High
                            </Badge>
                          ) : incident.priority === "medium" ? (
                            <Badge variant="outline" className="bg-warning text-warning-foreground">
                              Medium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              Low
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {incident.reporter ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/80 text-[10px] text-white">
                                  {incident.reporter.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{incident.reporter.fullName}</span>
                            </div>
                          ) : (
                            "Unknown"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(incident.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewIncident(incident)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleResolveIncident(incident.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Report Incident Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
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
              disabled={!title || !description}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Incident Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              View details about this incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-sm font-medium">Title</h3>
              <p className="font-medium">{selectedIncident?.title}</p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium">Priority</h3>
              {selectedIncident?.priority === "high" ? (
                <Badge variant="outline" className="bg-destructive text-destructive-foreground">
                  High
                </Badge>
              ) : selectedIncident?.priority === "medium" ? (
                <Badge variant="outline" className="bg-warning text-warning-foreground">
                  Medium
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Low
                </Badge>
              )}
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium">Description</h3>
              <div className="rounded-md border p-3">
                {selectedIncident?.description}
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <h3 className="mb-1 text-sm font-medium">Reported By</h3>
                <p className="text-sm">
                  {selectedIncident?.reporter?.fullName || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">Reported At</h3>
                <p className="text-sm">
                  {selectedIncident?.createdAt
                    ? new Date(selectedIncident.createdAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false);
                handleResolveIncident(selectedIncident?.id);
              }}
            >
              Resolve Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
