import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sidebar as SidebarComponent, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavItem({ href, icon, children, isActive }: NavItemProps) {
  const { state } = useSidebar();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>
            <Button
              variant="ghost"
              size="lg"
              className={cn(
                "w-full justify-start",
                state === "collapsed" && "justify-center",
                isActive && "bg-muted"
              )}
            >
              {React.cloneElement(icon as React.ReactElement, {
                className: cn("h-5 w-5 mr-3", state === "collapsed" && "mr-0")
              })}
              {state === "expanded" && <span>{children}</span>}
            </Button>
          </Link>
        </TooltipTrigger>
        {state === "collapsed" && <TooltipContent side="right">{children}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <SidebarComponent>
      <SidebarComponent.Header>
        <Link href="/dashboard">
          <div className="flex h-20 items-center px-6">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-6 w-6" />
              <span className="text-xl font-bold">ISP Tracker</span>
            </div>
          </div>
        </Link>
      </SidebarComponent.Header>
      <SidebarComponent.Content>
        <nav className="grid gap-1 px-2">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard />}
            isActive={location === "/dashboard"}
          >
            Dashboard
          </NavItem>
          <NavItem
            href="/projects"
            icon={<FolderKanban />}
            isActive={location === "/projects"}
          >
            Projects
          </NavItem>
          <NavItem
            href="/team-members"
            icon={<Users />}
            isActive={location === "/team-members"}
          >
            Team Members
          </NavItem>
          <NavItem
            href="/performance"
            icon={<BarChart3 />}
            isActive={location === "/performance"}
          >
            Performance
          </NavItem>
          <NavItem
            href="/reports"
            icon={<FileText />}
            isActive={location === "/reports"}
          >
            Reports
          </NavItem>
          <NavItem
            href="/settings"
            icon={<Settings />}
            isActive={location === "/settings"}
          >
            Settings
          </NavItem>
        </nav>
      </SidebarComponent.Content>
      <SidebarComponent.Footer>
        <div className="grid gap-1 px-2">
          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarComponent.Footer>
    </SidebarComponent>
  );
}