import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Settings,
  Bell,
  Shield,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  
  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [handoverReminders, setHandoverReminders] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [shiftChanges, setShiftChanges] = useState(true);
  
  const handleSaveProfile = () => {
    // In a real implementation, this would call an API endpoint
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };
  
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would call an API endpoint
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
    
    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleSaveNotifications = () => {
    // In a real implementation, this would call an API endpoint
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="profile" className="flex gap-1">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex gap-1">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex gap-1">
                  <Settings className="h-4 w-4" />
                  <span>Appearance</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Brief description about yourself"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button onClick={handleSaveProfile}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Update your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Change Password</h3>
                      <div className="grid gap-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 pt-4">
                      <h3 className="text-base font-medium">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Authenticator App</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Use an authenticator app to generate one-time codes
                          </p>
                        </div>
                        <Button variant="outline">Setup</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Recovery Codes</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Generate recovery codes to access your account in emergency
                          </p>
                        </div>
                        <Button variant="outline">Generate</Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Notification Channels</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-notifications">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via text message
                          </p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={smsNotifications}
                          onCheckedChange={setSmsNotifications}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Notification Types</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="handover-reminders">Handover Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive reminders for pending handovers
                          </p>
                        </div>
                        <Switch
                          id="handover-reminders"
                          checked={handoverReminders}
                          onCheckedChange={setHandoverReminders}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="incident-alerts">Incident Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive alerts for new incidents
                          </p>
                        </div>
                        <Switch
                          id="incident-alerts"
                          checked={incidentAlerts}
                          onCheckedChange={setIncidentAlerts}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="task-assignments">Task Assignments</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when assigned a task
                          </p>
                        </div>
                        <Switch
                          id="task-assignments"
                          checked={taskAssignments}
                          onCheckedChange={setTaskAssignments}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shift-changes">Shift Changes</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for shift schedule changes
                          </p>
                        </div>
                        <Switch
                          id="shift-changes"
                          checked={shiftChanges}
                          onCheckedChange={setShiftChanges}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button onClick={handleSaveNotifications}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize the appearance of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-20 w-full cursor-pointer items-center justify-center rounded-md bg-background border-2 border-primary">
                            <span className="font-medium">Light</span>
                          </div>
                          <span className="text-sm">Light Mode</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-20 w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 text-slate-50">
                            <span className="font-medium">Dark</span>
                          </div>
                          <span className="text-sm">Dark Mode</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-20 w-full cursor-pointer items-center justify-center rounded-md bg-gradient-to-r from-slate-100 to-slate-950">
                            <span className="font-medium text-white">System</span>
                          </div>
                          <span className="text-sm">System Preference</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Font Size</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-full cursor-pointer items-center justify-center rounded-md border border-input">
                            <span className="text-xs">Small</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-full cursor-pointer items-center justify-center rounded-md border border-input">
                            <span className="text-sm">Medium</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-full cursor-pointer items-center justify-center rounded-md border-2 border-primary">
                            <span className="text-base">Default</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-full cursor-pointer items-center justify-center rounded-md border border-input">
                            <span className="text-lg">Large</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Appearance
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
