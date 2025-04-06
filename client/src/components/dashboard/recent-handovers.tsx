import { useHandovers } from "@/hooks/use-handovers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export function RecentHandovers() {
  const { handovers, isLoading } = useHandovers();
  const [, navigate] = useLocation();

  // Get the 4 most recent handovers
  const recentHandovers = handovers.slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle>Recent Handovers</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/shift-logs")}>
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-[156px] w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentHandovers.map((handover) => (
                <TableRow key={handover.id}>
                  <TableCell className="font-medium">{handover.logNumber}</TableCell>
                  <TableCell className="capitalize">{handover.shift}</TableCell>
                  <TableCell>
                    <StatusBadge status={handover.status} />
                  </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-success/20 text-success">
          Completed
        </Badge>
      );
    case "requires_attention":
      return (
        <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
          Requires Attention
        </Badge>
      );
    case "pending_review":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          Pending Review
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          {status}
        </Badge>
      );
  }
}
