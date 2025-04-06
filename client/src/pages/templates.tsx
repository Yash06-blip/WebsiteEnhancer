import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Search,
  Sparkles,
  Copy,
  Edit,
  Trash,
} from "lucide-react";

interface Template {
  id: number;
  title: string;
  type: string;
  content: string;
  createdBy: number;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Templates() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);
  const [isViewTemplateDialogOpen, setIsViewTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // For the new template form
  const [title, setTitle] = useState("");
  const [type, setType] = useState("safety");
  const [content, setContent] = useState("");
  
  // For AI generation
  const [isGeneratingAiTemplate, setIsGeneratingAiTemplate] = useState(false);
  const [aiTemplateType, setAiTemplateType] = useState("safety");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: { title: string; type: string; content: string; createdBy: number }) => {
      const res = await apiRequest('POST', '/api/templates', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsNewTemplateDialogOpen(false);
      
      // Reset form
      setTitle("");
      setType("safety");
      setContent("");
    },
  });

  const generateAiTemplateMutation = useMutation({
    mutationFn: async (data: { type: string; createdBy: number }) => {
      const res = await apiRequest('POST', '/api/templates/generate', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsGeneratingAiTemplate(false);
      setAiTemplateType("safety");
    },
  });

  const handleCreateTemplate = async () => {
    if (!user) return;
    
    await createTemplateMutation.mutateAsync({
      title,
      type,
      content,
      createdBy: user.id,
    });
  };

  const handleGenerateAiTemplate = async () => {
    if (!user) return;
    
    setIsGeneratingAiTemplate(true);
    
    try {
      await generateAiTemplateMutation.mutateAsync({
        type: aiTemplateType,
        createdBy: user.id,
      });
    } catch (error) {
      console.error("Error generating template:", error);
      setIsGeneratingAiTemplate(false);
    }
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsViewTemplateDialogOpen(true);
  };

  // Filter templates based on activeTab and searchTerm
  const filteredTemplates = templates.filter(template => {
    const matchesTab = activeTab === "all" || template.type === activeTab;
    const matchesSearch = 
      searchTerm === "" || 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
            <div className="flex gap-2">
              <Button onClick={() => setIsNewTemplateDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New Template
              </Button>
              <Button variant="outline" onClick={() => setIsGeneratingAiTemplate(true)}>
                <Sparkles className="mr-1 h-4 w-4" />
                AI Generate
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="incident">Incident</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, index) => (
                <Card key={index} className="h-[200px] animate-pulse bg-muted/50"></Card>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center">
              <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || activeTab !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first template"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="line-clamp-1">{template.title}</CardTitle>
                      {template.isAiGenerated && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="capitalize">{template.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="line-clamp-4 text-sm">
                      {template.content.slice(0, 200)}
                      {template.content.length > 200 && "..."}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex w-full justify-between">
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewTemplate(template)}>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="sr-only">Copy</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Template Dialog */}
      <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for common reports and forms
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Template title" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Template content (supports markdown)" 
                rows={10} 
              />
              <p className="text-xs text-muted-foreground">
                Use markdown syntax for formatting. Example: ## Section Title, *italic*, **bold**
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate} 
              disabled={!title || !content}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={isGeneratingAiTemplate} onOpenChange={setIsGeneratingAiTemplate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate AI Template</DialogTitle>
            <DialogDescription>
              Let AI create a template based on your requirements
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ai-type">Template Type</Label>
              <Select value={aiTemplateType} onValueChange={setAiTemplateType}>
                <SelectTrigger id="ai-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety Report</SelectItem>
                  <SelectItem value="maintenance">Maintenance Log</SelectItem>
                  <SelectItem value="incident">Incident Investigation</SelectItem>
                  <SelectItem value="equipment">Equipment Checklist</SelectItem>
                  <SelectItem value="inspection">Site Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-medium">What will AI do?</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                The AI will generate a comprehensive template based on the selected type, including all necessary sections, fields, and instructions relevant to coal mining operations.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeneratingAiTemplate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAiTemplate}
              disabled={generateAiTemplateMutation.isPending}
            >
              {generateAiTemplateMutation.isPending ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog open={isViewTemplateDialogOpen} onOpenChange={setIsViewTemplateDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription className="capitalize">
              {selectedTemplate?.type} Template
              {selectedTemplate?.isAiGenerated && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Generated
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm">
              {selectedTemplate?.content}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewTemplateDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(selectedTemplate?.content || "");
                setIsViewTemplateDialogOpen(false);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
