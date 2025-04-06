import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartAnalysisToastProps {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}

export function SmartAnalysisToast({
  className,
  open: controlledOpen,
  onClose
}: SmartAnalysisToastProps) {
  const [open, setOpen] = useState(controlledOpen !== undefined ? controlledOpen : false);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
        onClose?.();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100] flex w-[380px] items-center justify-between gap-3 rounded-md border bg-background p-4 shadow-lg",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <div className="mb-1 flex items-center gap-1">
            <h5 className="font-medium">Smart Analysis Complete</h5>
            <span className="text-xs text-muted-foreground">just now</span>
          </div>
          <p className="text-sm">
            The AI has analyzed your latest handover log and found 2 potential issues that need attention.
          </p>
        </div>
      </div>
      <button 
        className="flex-shrink-0" 
        onClick={() => {
          setOpen(false);
          onClose?.();
        }}
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
