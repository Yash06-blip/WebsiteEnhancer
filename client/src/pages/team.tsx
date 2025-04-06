import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  Users,
  User,
  UserPlus,
  Building,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface TeamMember {
  id: number;
  fullName: string;
  initials: string;
  email?: string;
  phone?: string;
  role: string;
  department: string;
  experience: string;
  status: "active" | "on-leave" | "off-shift";
  lastActive: string;
}

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    fullName: "John Doe",
    initials: "JD",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    role: "Mining Manager",
    department: "Operations",
    experience: "8 years",
    status: "active",
    lastActive: "Just now"
  },
  {
    id: 2,
    fullName: "Robert Kumar",
    initials: "RK",
    email: "robert.kumar@example.com",
    phone: "+1 (555) 234-5678",
    role: "Shift Supervisor",
    department: "Operations",
    experience: "5 years",
    status: "active",
    lastActive: "10 minutes ago"
  },
  {
    id: 3,
    fullName: "Aisha Johnson",
    initials: "AJ",
    email: "aisha.johnson@example.com",
    phone: "+1 (555) 345-6789",
    role: "Safety Officer",
    department: "Safety",
    experience: "6 years",
    status: "active",
    lastActive: "1 hour ago"
  },
  {
    id: 4,
    fullName: "David Patel",
    initials: "DP",
    email: "david.patel@example.com",
    phone: "+1 (555) 456-7890",
    role: "Equipment Operator",
    department: "Mining",
    experience: "3 years",
    status: "off-shift",
    lastActive: "Yesterday"
  },
  {
    id: 5,
    fullName: "Sarah Brown",
    initials: "SB",
    email: "sarah.brown@example.com",
    phone: "+1 (555) 567-8901",
    role: "Maintenance Technician",
    department: "Maintenance",
    experience: "4 years",
    status: "on-leave",
    lastActive: "3 days ago"
  },
  {
    id: 6,
    fullName: "Michael Thompson",
    initials: "MT",
    email: "michael.thompson@example.com",
    phone: "+1 (555) 678-9012",
    role: "Mine Surveyor",
    department: "Engineering",
    experience: "7 years",
    status: "active",
    lastActive: "30 minutes ago"
  },
  {
    id: 7,
    fullName: "Lisa Wilson",
    initials: "LW",
    email: "lisa.wilson@example.com",
    phone: "+1 (555) 789-0123",
    role: "Equipment Operator",
    department: "Mining",
    experience: "2 years",
    status: "off-shift",
    lastActive: "Yesterday"
  },
  {
    id: 8,
    fullName: "James Smith",
    initials: "JS",
    email: "james.smith@example.com",
    phone: "+1 (555) 890-1234",
    role: "Ventilation Specialist",
    department: "Engineering",
    experience: "5 years",
    status: "active",
    lastActive: "2 hours ago"
  },
];

export default function Team() {
  const [viewType, setViewType] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isViewMemberDialogOpen, setIsViewMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Simulate a query for team members
  const { data: teamMembers = MOCK_TEAM_MEMBERS, isLoading } = useQuery({
    queryKey: ['/api/team'],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      return Promise.resolve(MOCK_TEAM_MEMBERS);
    },
    enabled: false // Not actually making a network request
  });

  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsViewMemberDialogOpen(true);
  };

  // Filter team members based on search and role
  const filteredMembers = teamMembers.filter(member => {
    const matchesRole = filterRole === "all" || member.role.toLowerCase().includes(filterRole.toLowerCase());
    const matchesSearch = 
      searchTerm === "" || 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="mr-1 h-4 w-4" />
              Invite Team Member
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>View and manage your team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Tabs 
                    value={viewType} 
                    onValueChange={setViewType}
                    className="hidden sm:block"
                  >
                    <TabsList>
                      <TabsTrigger value="grid">
                        <Users className="mr-1 h-4 w-4" />
                        Grid
                      </TabsTrigger>
                      <TabsTrigger value="table">
                        <FileText className="mr-1 h-4 w-4" />
                        Table
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center">
              <User className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">No team members found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterRole !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first team member"}
              </p>
            </div>
          ) : viewType === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{member.fullName}</CardTitle>
                          <CardDescription>{member.role}</CardDescription>
                        </div>
                      </div>
                      <StatusBadge status={member.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{member.department}</span>
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{member.experience} experience</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Active: {member.lastActive}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewMember(member)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                {member.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.fullName}</div>
                              {member.email && (
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          <StatusBadge status={member.status} />
                        </TableCell>
                        <TableCell>{member.experience}</TableCell>
                        <TableCell>{member.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewMember(member)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* View Team Member Dialog */}
      <Dialog open={isViewMemberDialogOpen} onOpenChange={setIsViewMemberDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Team Member Profile</DialogTitle>
            <DialogDescription>
              View detailed information about this team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMember && (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                      {selectedMember.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{selectedMember.fullName}</h2>
                    <p className="text-muted-foreground">{selectedMember.role}</p>
                    <StatusBadge status={selectedMember.status} className="mt-1" />
                  </div>
                </div>

                <div className="space-y-3 rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                      <p className="font-medium">{selectedMember.department}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
                      <p className="font-medium">{selectedMember.experience}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="font-medium">{selectedMember.email || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p className="font-medium">{selectedMember.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Active</h3>
                    <p className="font-medium">{selectedMember.lastActive}</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="rounded-md bg-muted p-2 text-sm">
                      <div className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Completed safety training - 2 days ago</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-2 text-sm">
                      <div className="flex gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Submitted shift handover log - 3 days ago</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-2 text-sm">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span>Reported an incident - 1 week ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewMemberDialogOpen(false)}>
              Close
            </Button>
            <Button>
              Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Team Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Enter email address" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                placeholder="e.g. Safety Officer, Equipment Operator" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                placeholder="e.g. Operations, Safety, Maintenance" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Input 
                id="message" 
                placeholder="Add a personal message to the invitation" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsInviteDialogOpen(false)}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className={`bg-success/20 text-success ${className}`}>
          Active
        </Badge>
      );
    case "on-leave":
      return (
        <Badge variant="outline" className={`bg-warning/20 text-warning-foreground ${className}`}>
          On Leave
        </Badge>
      );
    case "off-shift":
      return (
        <Badge variant="outline" className={`bg-muted text-muted-foreground ${className}`}>
          Off-Shift
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={`${className}`}>
          {status}
        </Badge>
      );
  }
}
