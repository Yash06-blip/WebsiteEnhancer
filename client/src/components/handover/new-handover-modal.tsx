import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useHandovers } from "@/hooks/use-handovers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewHandoverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewHandoverModal({ open, onOpenChange }: NewHandoverModalProps) {
  const { user } = useAuth();
  const { createHandover, isPendingCreate } = useHandovers();
  const { toast } = useToast();
  
  const [shift, setShift] = useState<"morning" | "evening" | "night">("morning");
  const [type, setType] = useState<"statutory" | "non-statutory">("statutory");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await createHandover({
        shift,
        type,
        content,
        userId: user.id,
      });
      
      // Reset form
      setShift("morning");
      setType("statutory");
      setContent("");
      setFiles(null);
      
      // Close modal
      onOpenChange(false);
      
      // Show a toast notification for AI analysis (simulating the async process)
      setTimeout(() => {
        toast({
          title: "Smart Analysis Complete",
          description: "AI has analyzed your handover log and found items that need attention.",
          action: (
            <Button variant="outline" size="sm" onClick={() => {}}>
              View
            </Button>
          ),
        });
      }, 2000);
    } catch (error) {
      console.error("Error creating handover:", error);
    }
  };

  const handleAiAssist = () => {
    // In a real implementation, this would call an API endpoint to get AI suggestions
    const suggestions = [
      "Check methane levels in section B3, consider increased ventilation.",
      "Equipment maintenance on Conveyor Belt #3 was completed during previous shift.",
      "Water drainage issue in Tunnel 4 still needs attention."
    ];
    
    // Append a random suggestion to the content
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setContent(prev => prev + (prev ? "\n\n" : "") + randomSuggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Handover</DialogTitle>
          <DialogDescription>
            Record your shift handover details below
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shift-type">Shift Type</Label>
              <Select
                value={shift}
                onValueChange={(value: "morning" | "evening" | "night") => setShift(value)}
              >
                <SelectTrigger id="shift-type">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-type">Log Type</Label>
              <Select
                value={type}
                onValueChange={(value: "statutory" | "non-statutory") => setType(value)}
              >
                <SelectTrigger id="log-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statutory">Statutory</SelectItem>
                  <SelectItem value="non-statutory">Non-Statutory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Handover Content</Label>
            <div className="relative">
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your handover details..."
                className="min-h-[150px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAiAssist}
                className="absolute bottom-2 right-2 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Assist
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="attachments">Attachments</Label>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="mr-1 h-3.5 w-3.5" />
                Choose files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
              />
              <span className="text-xs text-muted-foreground">
                {files && files.length > 0
                  ? `${files.length} file${files.length !== 1 ? "s" : ""} selected`
                  : "No files selected"}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!content || !shift || !type || isPendingCreate}
            onClick={handleSubmit}
          >
            {isPendingCreate ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
