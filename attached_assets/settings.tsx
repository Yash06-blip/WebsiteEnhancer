import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  HelpCircle, 
  Bell, 
  MoonStar,
  Sun,
  Monitor,
  CheckSquare,
  ToggleLeft,
  FileCog
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@shared/schema";

export default function Settings() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Map role_id to role name
  const getRoleName = (roleId: number | undefined) => {
    switch (roleId) {
      case 1: return UserRole.MANAGER;
      case 2: return UserRole.OPERATOR;
      case 3: return UserRole.SUPERVISOR;
      default: return "Unknown";
    }
  };
  
  const getTabFromUrl = () => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    return searchParams.get('tab') || 'general';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [theme, setTheme] = useState("light");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [autoLogout, setAutoLogout] = useState("30");
  const [defaultLogType, setDefaultLogType] = useState("non-statutory");
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-medium text-neutral-dark">Settings</h3>
          <p className="text-sm text-neutral-medium mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-neutral-lighter border">
            <TabsTrigger value="general" className="data-[state=active]:bg-white">
              <SettingsIcon size={16} className="mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white">
              <Bell size={16} className="mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-white">
              <Sun size={16} className="mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white">
              <FileCog size={16} className="mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="permissions" className="data-[state=active]:bg-white">
              <ShieldAlert size={16} className="mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-white">
              <HelpCircle size={16} className="mr-2" />
              Help
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={user?.username || ''} disabled />
                    <p className="text-xs text-neutral-medium">Your username cannot be changed.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name || ''} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={getRoleName(user?.role_id).charAt(0).toUpperCase() + getRoleName(user?.role_id).slice(1) || ''} disabled />
                  <p className="text-xs text-neutral-medium">
                    Role changes need to be requested from your administrator.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autoLogout">Auto Logout Timeout</Label>
                  <Select value={autoLogout} onValueChange={setAutoLogout}>
                    <SelectTrigger id="autoLogout">
                      <SelectValue placeholder="Select timeout period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-medium">
                    Automatically log out after a period of inactivity.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultLogType">Default Log Type</Label>
                  <Select value={defaultLogType} onValueChange={setDefaultLogType}>
                    <SelectTrigger id="defaultLogType">
                      <SelectValue placeholder="Select default log type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="statutory">Statutory</SelectItem>
                      <SelectItem value="non-statutory">Non-Statutory</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-medium">
                    Default log type when creating new handover logs.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-neutral-medium">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-notifications">In-App Notifications</Label>
                      <p className="text-sm text-neutral-medium">
                        Receive notifications in the application
                      </p>
                    </div>
                    <Switch 
                      id="app-notifications" 
                      checked={appNotifications}
                      onCheckedChange={setAppNotifications}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">What to notify me about:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-handovers" defaultChecked />
                      <Label htmlFor="notify-handovers">Handover logs requiring attention</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-incidents" defaultChecked />
                      <Label htmlFor="notify-incidents">New incidents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-tasks" defaultChecked />
                      <Label htmlFor="notify-tasks">New tasks assigned to me</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-shifts" defaultChecked />
                      <Label htmlFor="notify-shifts">Upcoming shift reminders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-comments" defaultChecked />
                      <Label htmlFor="notify-comments">Comments on my logs</Label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${theme === 'light' ? 'border-primary bg-primary-light' : 'border-neutral-light'}`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Sun size={24} className={theme === 'light' ? 'text-primary' : 'text-neutral-medium'} />
                        <span className={theme === 'light' ? 'font-medium text-primary' : ''}>Light</span>
                      </div>
                    </div>
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${theme === 'dark' ? 'border-primary bg-primary-light' : 'border-neutral-light'}`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <MoonStar size={24} className={theme === 'dark' ? 'text-primary' : 'text-neutral-medium'} />
                        <span className={theme === 'dark' ? 'font-medium text-primary' : ''}>Dark</span>
                      </div>
                    </div>
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${theme === 'system' ? 'border-primary bg-primary-light' : 'border-neutral-light'}`}
                      onClick={() => setTheme('system')}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Monitor size={24} className={theme === 'system' ? 'text-primary' : 'text-neutral-medium'} />
                        <span className={theme === 'system' ? 'font-medium text-primary' : ''}>System</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label className="text-base">Display Density</Label>
                  <div className="flex items-center space-x-4">
                    <Select defaultValue="default">
                      <SelectTrigger>
                        <SelectValue placeholder="Select density" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-medium">
                      Control how densely information is displayed
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Appearance</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Log Templates</CardTitle>
                <CardDescription>
                  Configure templates for different log types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Statutory Log Templates</h3>
                    {getRoleName(user?.role_id) === 'manager' && (
                      <Button variant="outline" size="sm">
                        <ToggleLeft size={16} className="mr-2" />
                        Manage Templates
                      </Button>
                    )}
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-neutral-lighter p-3 font-medium border-b">
                      Available Templates
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center p-2 hover:bg-neutral-lighter rounded-md">
                        <div>
                          <div className="font-medium">Safety Compliance Log</div>
                          <div className="text-sm text-neutral-medium">Standard safety compliance checklist</div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-neutral-lighter rounded-md">
                        <div>
                          <div className="font-medium">Environmental Monitoring</div>
                          <div className="text-sm text-neutral-medium">Environmental readings and compliance</div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-neutral-lighter rounded-md">
                        <div>
                          <div className="font-medium">Equipment Maintenance</div>
                          <div className="text-sm text-neutral-medium">Scheduled equipment checks and maintenance</div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Non-Statutory Log Templates</h3>
                    {getRoleName(user?.role_id) === 'manager' && (
                      <Button variant="outline" size="sm">
                        <ToggleLeft size={16} className="mr-2" />
                        Manage Templates
                      </Button>
                    )}
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-neutral-lighter p-3 font-medium border-b">
                      Available Templates
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center p-2 hover:bg-neutral-lighter rounded-md">
                        <div>
                          <div className="font-medium">Shift Summary</div>
                          <div className="text-sm text-neutral-medium">General shift handover summary</div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-neutral-lighter rounded-md">
                        <div>
                          <div className="font-medium">Production Status</div>
                          <div className="text-sm text-neutral-medium">Production metrics and performance</div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-neutral-lighter rounded-md">
                        <div>
                          <div className="font-medium">Process Deviation</div>
                          <div className="text-sm text-neutral-medium">Log process deviations and corrective actions</div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {getRoleName(user?.role_id) === 'manager' && (
                  <div className="pt-4">
                    <Button>
                      <CheckSquare size={16} className="mr-2" />
                      Create New Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  View permissions assigned to your role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-neutral-lighter p-3 font-medium border-b flex justify-between items-center">
                    <span>Current Role: <span className="capitalize">{getRoleName(user?.role_id)}</span></span>
                    {getRoleName(user?.role_id) === 'manager' && (
                      <Button variant="outline" size="sm">Manage Roles</Button>
                    )}
                  </div>
                  <div className="p-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="handovers">
                        <AccordionTrigger>Handover Logs</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pl-4">
                            {getRoleName(user?.role_id) === 'operator' && (
                              <>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Create new handover logs</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>View own handover logs</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Edit own draft handover logs</span>
                                </div>
                              </>
                            )}
                            {getRoleName(user?.role_id) === 'supervisor' && (
                              <>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Create new handover logs</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>View all handover logs</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Review and approve handover logs</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Add comments to handover logs</span>
                                </div>
                              </>
                            )}
                            {getRoleName(user?.role_id) === 'manager' && (
                              <>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Full access to all handover logs</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Configure log templates</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Generate reports</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckSquare size={16} className="text-secondary mr-2" />
                                  <span>Manage user permissions</span>
                                </div>
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="incidents">
                        <AccordionTrigger>Incidents</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pl-4">
                            <div className="flex items-center">
                              <CheckSquare size={16} className="text-secondary mr-2" />
                              <span>Report new incidents</span>
                            </div>
                            <div className="flex items-center">
                              <CheckSquare size={16} className="text-secondary mr-2" />
                              <span>View active incidents</span>
                            </div>
                            {(getRoleName(user?.role_id) === 'supervisor' || getRoleName(user?.role_id) === 'manager') && (
                              <div className="flex items-center">
                                <CheckSquare size={16} className="text-secondary mr-2" />
                                <span>Update incident status</span>
                              </div>
                            )}
                            {getRoleName(user?.role_id) === 'manager' && (
                              <div className="flex items-center">
                                <CheckSquare size={16} className="text-secondary mr-2" />
                                <span>Generate incident reports</span>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="tasks">
                        <AccordionTrigger>Tasks</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pl-4">
                            <div className="flex items-center">
                              <CheckSquare size={16} className="text-secondary mr-2" />
                              <span>View assigned tasks</span>
                            </div>
                            <div className="flex items-center">
                              <CheckSquare size={16} className="text-secondary mr-2" />
                              <span>Mark tasks as complete</span>
                            </div>
                            {(getRoleName(user?.role_id) === 'supervisor' || getRoleName(user?.role_id) === 'manager') && (
                              <div className="flex items-center">
                                <CheckSquare size={16} className="text-secondary mr-2" />
                                <span>Create and assign tasks</span>
                              </div>
                            )}
                            {getRoleName(user?.role_id) === 'manager' && (
                              <div className="flex items-center">
                                <CheckSquare size={16} className="text-secondary mr-2" />
                                <span>Delete tasks</span>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
                
                {getRoleName(user?.role_id) === 'manager' && (
                  <div className="pt-4">
                    <Button>Manage User Permissions</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>
                  Get assistance with using the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Documentation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">User Guide</span>
                        <span className="text-sm text-neutral-medium mt-1">Complete usage instructions</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Quick Start Guide</span>
                        <span className="text-sm text-neutral-medium mt-1">Essential information for new users</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Role-specific Guides</span>
                        <span className="text-sm text-neutral-medium mt-1">Instructions for operators, supervisors, and managers</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Template Guidelines</span>
                        <span className="text-sm text-neutral-medium mt-1">How to use and create templates</span>
                      </div>
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">FAQ</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="faq-1">
                      <AccordionTrigger>How do I create a new handover log?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-neutral-medium">
                          To create a new handover log, click the "New Log" button in the header or use the quick action on the dashboard. 
                          You'll be prompted to select a log type (statutory or non-statutory) and can then fill in the required information.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-2">
                      <AccordionTrigger>What's the difference between statutory and non-statutory logs?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-neutral-medium">
                          Statutory logs are required by regulations and typically include safety incidents, environmental records, 
                          equipment maintenance, and compliance checks. Non-statutory logs are for routine operations, shift performance, 
                          process deviations, and general remarks.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-3">
                      <AccordionTrigger>How do I report an incident?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-neutral-medium">
                          To report an incident, navigate to the Incidents page and click "Report Incident." Fill in the required information 
                          including title, description, and priority level. The incident will be logged and visible to supervisors and managers.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-4">
                      <AccordionTrigger>What does the AI assistant help with?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-neutral-medium">
                          The AI assistant can help with creating handover logs, categorizing incidents, suggesting relevant information to include, 
                          answering questions about the system, and providing guidance on compliance requirements. Click the robot icon in the 
                          bottom-right corner to access the AI assistant.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Support</h3>
                  <div className="bg-neutral-lighter p-4 rounded-lg">
                    <p className="mb-4">If you need additional assistance, contact our support team:</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium w-24">Email:</span>
                        <span>support@shiftsync.com</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium w-24">Phone:</span>
                        <span>+1 (800) 555-0123</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium w-24">Hours:</span>
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}