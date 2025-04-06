import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHandoverAiAnalysis, useAiRecommendations } from "@/hooks/use-handovers";
import { RefreshCw, RotateCw, Sparkles, Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for API response types
interface AIAnalysisResponse {
  category: string;
  importance: "low" | "medium" | "high";
  suggestions: string[];
  keywords: string[];
  followUpActions?: string[];
}

type AnalysisData = AIAnalysisResponse | undefined | null;

export function AiAssistant() {
  const [selectedLog, setSelectedLog] = useState<number | null>(4); // Default to logId 4 for demo
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { analysis, isLoading: isLoadingAnalysis } = useHandoverAiAnalysis(selectedLog);
  const { recommendations, isLoading: isLoadingRecommendations } = useAiRecommendations();
  
  // Function to handle refreshing AI analysis
  const handleRefreshAnalysis = () => {
    // Invalidate the query cache to refresh data
    queryClient.invalidateQueries({ queryKey: [`/api/ai-analysis/${selectedLog}`] });
    queryClient.invalidateQueries({ queryKey: ['/api/ai-recommendations'] });
    
    toast({
      title: "Refreshing AI Analysis",
      description: "Updating insights based on latest data...",
      duration: 2000,
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>Smart insights and automation for your mine operations</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRefreshAnalysis}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => 
              toast({
                title: "AI Settings",
                description: "Settings panel will be implemented in a future update.",
                duration: 3000,
              })
            }>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* AI Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Latest AI Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAnalysis ? (
                <div className="flex justify-center py-4">
                  <RotateCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : analysis ? (
                <>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm text-card-foreground">
                      <span className="font-semibold">Safety Note:</span>{" "}
                      {analysis.suggestions?.[0] || "No suggestions available."}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {analysis.keywords?.map((keyword: string, idx: number) => (
                        <span key={idx} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm">View Details</Button>
                  </div>
                </>
              ) : (
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  No analysis available
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Smart Suggestions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRecommendations ? (
                <div className="flex justify-center py-4">
                  <RotateCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recommendations ? (
                <div className="space-y-2">
                  {recommendations.split('\n').filter(Boolean).slice(0, 3).map((suggestion: string, idx: number) => (
                    <div key={idx} className="rounded-md bg-muted p-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 pt-0.5">
                          {idx === 0 ? (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/20 text-success">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                          ) : idx === 1 ? (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-warning/20 text-warning">
                              <TimeIcon className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground">
                              <ArrowRightIcon className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <p>{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-md bg-muted p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/20 text-success">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                      </div>
                      <p>Check equipment maintenance logs for conveyor belt #4</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-warning/20 text-warning">
                          <TimeIcon className="h-3 w-3" />
                        </span>
                      </div>
                      <p>Follow up on water drainage issue reported yesterday</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground">
                          <ArrowRightIcon className="h-3 w-3" />
                        </span>
                      </div>
                      <p>Plan next week's maintenance schedule</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Templates */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileCodeIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Smart Templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Generate AI-assisted templates for common reports
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="flex w-full justify-between" size="sm">
                  <span>Safety Inspection Report</span>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="flex w-full justify-between" size="sm">
                  <span>Equipment Maintenance Log</span>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="flex w-full justify-between" size="sm">
                  <span>Incident Investigation Form</span>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TimeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <circle cx="12" cy="14" r="4" />
      <path d="M12 12v2l1 1" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function FileCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  );
}
