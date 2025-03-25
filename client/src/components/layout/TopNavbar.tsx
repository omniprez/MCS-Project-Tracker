import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";

interface TopNavbarProps {
  onMenuClick: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const [_, setLocation] = useLocation();
  const { user, refetchUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        // Clear user data in our context
        await refetchUser();
        
        toast({
          title: "Logout Successful",
          description: "You have been logged out successfully."
        });
        
        // Redirect to login
        setLocation("/login");
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: data.message || "Something went wrong. Please try again."
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again."
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative z-10 flex h-16 flex-shrink-0 bg-gradient-to-r from-indigo-600 to-cyan-600 shadow md:hidden">
      <Button
        variant="ghost"
        className="border-r border-indigo-700 px-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1">
          <h1 className="text-xl font-bold text-white my-auto">ISP Project Tracker</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button 
            type="button" 
            className="px-3 py-1 rounded text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white text-sm font-medium flex items-center gap-1"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-1" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
          <div className="relative ml-3">
            <div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">{getUserInitials()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}