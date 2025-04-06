import { useState, useEffect } from "react";
import { Menu, Search, Bell, HelpCircle, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription
} from "@/components/ui/dialog";

type SearchResult = {
  id: number;
  title: string;
  type: string;
  path: string;
};

export function Header() {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  
  // Mock search data - in a real app, this would come from API
  const mockSearchData: SearchResult[] = [
    { id: 1, title: "Morning Shift Report", type: "Handover Log", path: "/shift-logs" },
    { id: 2, title: "Safety Inspection Template", type: "Template", path: "/templates" },
    { id: 3, title: "Ventilation Issue", type: "Incident", path: "/incidents" },
    { id: 4, title: "Equipment Maintenance", type: "Handover Log", path: "/shift-logs" },
    { id: 5, title: "Monthly Production", type: "Report", path: "/reports" },
    { id: 6, title: "John Smith", type: "Team Member", path: "/team" }
  ];
  
  useEffect(() => {
    if (searchValue.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const results = mockSearchData.filter(item => 
        item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.type.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
      
      // If there are results and the search value is not empty, open the dialog
      if (results.length > 0 && searchValue.trim() !== '') {
        setIsSearchDialogOpen(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchValue]);
  
  const handleClearSearch = () => {
    setSearchValue("");
    setSearchResults([]);
    setIsSearchDialogOpen(false);
  };
  
  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    handleClearSearch();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-9 w-[200px] pl-8 sm:w-[300px]"
          />
          {searchValue && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1 h-7 w-7"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                  3
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="space-y-2">
                  <div className="rounded-md border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">New Incident Reported</p>
                        <p className="text-sm text-muted-foreground">Ventilation issue in Section C requires attention</p>
                      </div>
                      <span className="text-xs text-muted-foreground">10m ago</span>
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Handover Log Review</p>
                        <p className="text-sm text-muted-foreground">Your report needs additional information</p>
                      </div>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Maintenance Scheduled</p>
                        <p className="text-sm text-muted-foreground">Equipment maintenance scheduled for tomorrow</p>
                      </div>
                      <span className="text-xs text-muted-foreground">3h ago</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">View All Notifications</Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Help">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Help & Support</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Quick Actions</h4>
                    <ul className="ml-4 mt-2 list-disc">
                      <li>View user manual</li>
                      <li>Browse training videos</li>
                      <li>Contact support team</li>
                      <li>Report a bug</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Common Questions</h4>
                    <ul className="ml-4 mt-2 list-disc">
                      <li>How to create a handover log?</li>
                      <li>Setting up templates</li>
                      <li>Managing incident reports</li>
                      <li>Changing notification settings</li>
                    </ul>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Contact Support</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              {searchResults.length} results found for "{searchValue}"
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                className="flex w-full items-start gap-2 rounded-md p-2 text-left hover:bg-accent"
                onClick={() => handleResultClick(result)}
              >
                <div>
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-muted-foreground">{result.type}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
