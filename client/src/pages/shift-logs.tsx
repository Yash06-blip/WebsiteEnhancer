import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useHandovers } from "@/hooks/use-handovers";
import { useAuth } from "@/hooks/use-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Filter,
  Plus,
  FileText,
  Eye,
  Edit,
  Check,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { NewHandoverModal } from "@/components/handover/new-handover-modal";

export default function ShiftLogs() {
  const { handovers, isLoading, updateHandoverStatus } = useHandovers();
  const { user } = useAuth();
  
  const [isNewHandoverModalOpen, setIsNewHandoverModalOpen] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("completed");
  
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewHandover = (handover: any) => {
    setSelectedHandover(handover);
    setIsViewDialogOpen(true);
  };

  const handleReviewHandover = (handover: any) => {
    setSelectedHandover(handover);
    setReviewComment(handover.comments || "");
    setReviewStatus(handover.status);
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!user || !selectedHandover) return;

    try {
      await updateHandoverStatus({
        id: selectedHandover.id,
        status: reviewStatus as any,
        comments: reviewComment,
        reviewedBy: user.id,
      });
      
      setIsReviewDialogOpen(false);
    } catch (error) {
      console.error("Error updating handover:", error);
    }
  };

  // Filter and search handovers
  const filteredHandovers = handovers.filter(handover => {
    const matchesStatus = filterStatus === "all" || handover.status === filterStatus;
    const matchesShift = filterShift === "all" || handover.shift === filterShift;
    const matchesSearch = 
      searchTerm === "" || 
      handover.logNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      handover.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (handover.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesShift && matchesSearch;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Shift Handover Logs</h1>
            <Button onClick={() => setIsNewHandoverModalOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              New Handover
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter and search through handover logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="mb-2 block">Search</Label>
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="Search by ID, content, or user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter" className="mb-2 block">Status</Label>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger id="status-filter" className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="requires_attention">Requires Attention</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shift-filter" className="mb-2 block">Shift</Label>
                  <Select
                    value={filterShift}
                    onValueChange={setFilterShift}
                  >
                    <SelectTrigger id="shift-filter" className="w-[180px]">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shifts</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredHandovers.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center">
                  <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No handover logs found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterStatus !== "all" || filterShift !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first handover log"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>AI Analysis</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHandovers.map((handover) => (
                      <TableRow key={handover.id}>
                        <TableCell className="font-medium">{handover.logNumber}</TableCell>
                        <TableCell>
                          {handover.user ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/80 text-[10px] text-white">
                                  {handover.user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{handover.user.fullName}</span>
                            </div>
                          ) : (
                            "Unknown User"
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{handover.shift}</TableCell>
                        <TableCell>{handover.type === "statutory" ? "Statutory" : "Non-Statutory"}</TableCell>
                        <TableCell>
                          {handover.status === "completed" ? (
                            <Badge variant="outline" className="bg-success/20 text-success">
                              <Check className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          ) : handover.status === "requires_attention" ? (
                            <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Requires Attention
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending Review
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(handover.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {handover.comments && handover.comments.includes("category") ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              <Sparkles className="mr-1 h-3 w-3" />
                              Available
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewHandover(handover)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleReviewHandover(handover)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Review</span>
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

      <NewHandoverModal 
        open={isNewHandoverModalOpen} 
        onOpenChange={setIsNewHandoverModalOpen} 
      />

      {/* View Handover Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Handover Details</DialogTitle>
            <DialogDescription>
              {selectedHandover?.logNumber} - {selectedHandover?.shift} Shift
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-sm font-medium">Status</h3>
              {selectedHandover?.status === "completed" ? (
                <Badge variant="outline" className="bg-success/20 text-success">
                  <Check className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              ) : selectedHandover?.status === "requires_attention" ? (
                <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Requires Attention
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Pending Review
                </Badge>
              )}
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium">Content</h3>
              <div className="rounded-md border p-3 text-sm">
                {selectedHandover?.content}
              </div>
            </div>
            {selectedHandover?.comments && (
              <div>
                <h3 className="mb-1 text-sm font-medium">Comments</h3>
                <div className="rounded-md border p-3 text-sm">
                  {selectedHandover.comments}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <div>
                <h3 className="mb-1 text-sm font-medium">Created By</h3>
                <p className="text-sm">
                  {selectedHandover?.user?.fullName || "Unknown User"}
                </p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">Created At</h3>
                <p className="text-sm">
                  {selectedHandover?.createdAt
                    ? new Date(selectedHandover.createdAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              handleReviewHandover(selectedHandover);
            }}>
              Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Handover Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Handover</DialogTitle>
            <DialogDescription>
              Update the status and add comments to this handover log
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handover-content">Content</Label>
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                {selectedHandover?.content}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={reviewStatus}
                onValueChange={setReviewStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="requires_attention">Requires Attention</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add your review comments..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
