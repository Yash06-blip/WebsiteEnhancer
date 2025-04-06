import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart4,
  LineChart,
  PieChart,
  Calendar,
  Download,
  BarChart,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import charts components
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Define types for report data
interface HandoverStat {
  name: string;
  date: string;
  completed: number;
  pending: number;
  attention: number;
}

interface IncidentStat {
  name: string;
  date: string;
  high: number;
  medium: number;
  low: number;
}

interface TaskStat {
  name: string;
  date: string;
  completed: number;
  pending: number;
}

interface HandoverType {
  name: string;
  value: number;
}

interface SummaryMetrics {
  safetyMetrics: {
    highPriorityIncidents: number;
    safetyCompliance: string;
    equipmentReliability: string;
  };
  productionMetrics: {
    shiftEfficiency: string;
    taskCompletion: string;
    maintenanceAdherence: string;
  };
}

interface ReportData {
  handoverStats: HandoverStat[];
  incidentStats: IncidentStat[];
  taskStats: TaskStat[];
  handoverTypes: HandoverType[];
  summaryMetrics: SummaryMetrics;
}

export default function Reports() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("handovers");
  const [dateRange, setDateRange] = useState("last7days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Default color scheme for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Fetch report data based on selected date range
  useEffect(() => {
    async function fetchReportData() {
      setIsLoading(true);
      try {
        let queryParams = new URLSearchParams();
        
        if (dateRange === "custom" && startDate && endDate) {
          queryParams.append("startDate", startDate);
          queryParams.append("endDate", endDate);
        } else {
          queryParams.append("period", dateRange);
        }
        
        const response = await fetch(`/api/reports?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReportData();
  }, [dateRange, startDate, endDate, toast]);

  // Function to handle exporting of reports
  const handleExportReport = () => {
    if (!reportData) return;
    
    // Determine which data to export based on active tab
    let exportData;
    let fileName;

    switch (activeTab) {
      case 'handovers':
        exportData = reportData.handoverStats;
        fileName = 'handover-report';
        break;
      case 'incidents':
        exportData = reportData.incidentStats;
        fileName = 'incident-report';
        break;
      case 'tasks':
        exportData = reportData.taskStats;
        fileName = 'task-report';
        break;
      case 'summary':
        exportData = reportData.summaryMetrics;
        fileName = 'summary-report';
        break;
      default:
        exportData = reportData.handoverStats;
        fileName = 'coal-mine-report';
    }

    // Format current date for filename
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Convert data to JSON format
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-${formattedDate}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <Button onClick={handleExportReport}>
              <Download className="mr-1 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
              <CardDescription>Select date range and report options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div>
                  <Label htmlFor="date-range" className="mb-2 block">Date Range</Label>
                  <Select
                    value={dateRange}
                    onValueChange={setDateRange}
                  >
                    <SelectTrigger id="date-range" className="w-[180px]">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dateRange === "custom" && (
                  <>
                    <div>
                      <Label htmlFor="start-date" className="mb-2 block">Start Date</Label>
                      <div className="relative">
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Calendar className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="mb-2 block">End Date</Label>
                      <div className="relative">
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                        <Calendar className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="handovers" className="flex gap-1">
                <BarChart4 className="h-4 w-4" />
                <span>Handovers</span>
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex gap-1">
                <LineChart className="h-4 w-4" />
                <span>Incidents</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex gap-1">
                <BarChart className="h-4 w-4" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex gap-1">
                <PieChart className="h-4 w-4" />
                <span>Summary</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="handovers">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Handover Statistics</CardTitle>
                    <CardDescription>Weekly handover logs by status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : !reportData?.handoverStats.length ? (
                        <div className="flex h-full flex-col items-center justify-center">
                          <p className="text-muted-foreground">No data available for selected period</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={reportData?.handoverStats}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="completed" name="Completed" fill="#16a34a" />
                            <Bar dataKey="pending" name="Pending" fill="#6b7280" />
                            <Bar dataKey="attention" name="Needs Attention" fill="#f59e0b" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Handover Types</CardTitle>
                    <CardDescription>Distribution by log type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : !reportData?.handoverTypes.length ? (
                        <div className="flex h-full flex-col items-center justify-center">
                          <p className="text-muted-foreground">No data available for selected period</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={reportData?.handoverTypes}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {reportData?.handoverTypes.map((entry, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="incidents">
              <Card>
                <CardHeader>
                  <CardTitle>Incident Trends</CardTitle>
                  <CardDescription>Weekly incidents by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !reportData?.incidentStats.length ? (
                      <div className="flex h-full flex-col items-center justify-center">
                        <p className="text-muted-foreground">No data available for selected period</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={reportData?.incidentStats}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="high" 
                            name="High Priority" 
                            stroke="#ef4444" 
                            strokeWidth={2} 
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="medium" 
                            name="Medium Priority" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="low" 
                            name="Low Priority" 
                            stroke="#6b7280" 
                            strokeWidth={2}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion</CardTitle>
                  <CardDescription>Weekly tasks by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !reportData?.taskStats.length ? (
                      <div className="flex h-full flex-col items-center justify-center">
                        <p className="text-muted-foreground">No data available for selected period</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={reportData?.taskStats}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#16a34a" />
                          <Bar dataKey="pending" name="Pending" fill="#6b7280" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Safety Metrics</CardTitle>
                    <CardDescription>Key safety indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !reportData ? (
                      <div className="flex h-full flex-col items-center justify-center">
                        <p className="text-muted-foreground">No data available for selected period</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">High-Priority Incidents</h3>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-2xl font-bold">{reportData.summaryMetrics.safetyMetrics.highPriorityIncidents}</p>
                            <Badge className="bg-destructive">
                              +{Math.round(reportData.summaryMetrics.safetyMetrics.highPriorityIncidents * 0.2)} from last period
                            </Badge>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div 
                              className="h-2 rounded-full bg-destructive" 
                              style={{ width: `${Math.min(100, reportData.summaryMetrics.safetyMetrics.highPriorityIncidents * 8)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Safety Compliance</h3>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-2xl font-bold">{reportData.summaryMetrics.safetyMetrics.safetyCompliance}</p>
                            <Badge className="bg-success">
                              +3% from last period
                            </Badge>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div 
                              className="h-2 rounded-full bg-success"
                              style={{ width: reportData.summaryMetrics.safetyMetrics.safetyCompliance }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Equipment Reliability</h3>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-2xl font-bold">{reportData.summaryMetrics.safetyMetrics.equipmentReliability}</p>
                            <Badge className="bg-warning">
                              -2% from last period
                            </Badge>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div 
                              className="h-2 rounded-full bg-primary"
                              style={{ width: reportData.summaryMetrics.safetyMetrics.equipmentReliability }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Production Metrics</CardTitle>
                    <CardDescription>Operational efficiency indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !reportData ? (
                      <div className="flex h-full flex-col items-center justify-center">
                        <p className="text-muted-foreground">No data available for selected period</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Shift Efficiency</h3>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-2xl font-bold">{reportData.summaryMetrics.productionMetrics.shiftEfficiency}</p>
                            <Badge className="bg-success">
                              +5% from last period
                            </Badge>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div 
                              className="h-2 rounded-full bg-success" 
                              style={{ width: reportData.summaryMetrics.productionMetrics.shiftEfficiency }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Task Completion Rate</h3>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-2xl font-bold">{reportData.summaryMetrics.productionMetrics.taskCompletion}</p>
                            <Badge className="bg-success">
                              +2% from last period
                            </Badge>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div 
                              className="h-2 rounded-full bg-primary"
                              style={{ width: reportData.summaryMetrics.productionMetrics.taskCompletion }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Maintenance Adherence</h3>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-2xl font-bold">{reportData.summaryMetrics.productionMetrics.maintenanceAdherence}</p>
                            <Badge className="bg-warning">
                              -3% from last period
                            </Badge>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div 
                              className="h-2 rounded-full bg-warning"
                              style={{ width: reportData.summaryMetrics.productionMetrics.maintenanceAdherence }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
