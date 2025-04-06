import { useState } from "react";
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
} from "lucide-react";

// Import charts components
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("handovers");
  const [dateRange, setDateRange] = useState("last7days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sample data for charts
  const handoverData = [
    { name: "Mon", completed: 4, pending: 1, attention: 2 },
    { name: "Tue", completed: 5, pending: 2, attention: 1 },
    { name: "Wed", completed: 3, pending: 3, attention: 2 },
    { name: "Thu", completed: 6, pending: 2, attention: 0 },
    { name: "Fri", completed: 5, pending: 1, attention: 1 },
    { name: "Sat", completed: 4, pending: 2, attention: 0 },
    { name: "Sun", completed: 3, pending: 1, attention: 1 },
  ];

  const incidentData = [
    { name: "Mon", high: 1, medium: 2, low: 3 },
    { name: "Tue", high: 0, medium: 3, low: 2 },
    { name: "Wed", high: 1, medium: 1, low: 4 },
    { name: "Thu", high: 0, medium: 2, low: 3 },
    { name: "Fri", high: 2, medium: 1, low: 2 },
    { name: "Sat", high: 0, medium: 1, low: 2 },
    { name: "Sun", high: 1, medium: 0, low: 1 },
  ];

  const taskData = [
    { name: "Mon", completed: 5, pending: 3 },
    { name: "Tue", completed: 7, pending: 4 },
    { name: "Wed", completed: 4, pending: 6 },
    { name: "Thu", completed: 9, pending: 2 },
    { name: "Fri", completed: 6, pending: 3 },
    { name: "Sat", completed: 3, pending: 2 },
    { name: "Sun", completed: 2, pending: 1 },
  ];

  const handoverTypePieData = [
    { name: "Statutory", value: 23 },
    { name: "Non-Statutory", value: 17 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <Button>
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
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={handoverData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#16a34a" />
                          <Bar dataKey="pending" name="Pending" fill="#6b7280" />
                          <Bar dataKey="attention" name="Needs Attention" fill="#f59e0b" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
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
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={handoverTypePieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {handoverTypePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
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
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={incidentData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
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
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={taskData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" name="Completed" fill="#16a34a" />
                        <Bar dataKey="pending" name="Pending" fill="#6b7280" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
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
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">High-Priority Incidents</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-2xl font-bold">5</p>
                          <Badge className="bg-destructive">
                            +2 from last period
                          </Badge>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div className="h-2 w-[40%] rounded-full bg-destructive"></div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Safety Compliance</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-2xl font-bold">94%</p>
                          <Badge className="bg-success">
                            +3% from last period
                          </Badge>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div className="h-2 w-[94%] rounded-full bg-success"></div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Equipment Reliability</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-2xl font-bold">87%</p>
                          <Badge className="bg-warning">
                            -2% from last period
                          </Badge>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div className="h-2 w-[87%] rounded-full bg-primary"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Production Metrics</CardTitle>
                    <CardDescription>Operational efficiency indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Shift Efficiency</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-2xl font-bold">92%</p>
                          <Badge className="bg-success">
                            +5% from last period
                          </Badge>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div className="h-2 w-[92%] rounded-full bg-success"></div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Handover Completion Rate</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-2xl font-bold">89%</p>
                          <Badge className="bg-success">
                            +2% from last period
                          </Badge>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div className="h-2 w-[89%] rounded-full bg-primary"></div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Maintenance Backlog</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-2xl font-bold">8 tasks</p>
                          <Badge className="bg-warning">
                            +3 from last period
                          </Badge>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div className="h-2 w-[30%] rounded-full bg-warning"></div>
                        </div>
                      </div>
                    </div>
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
