import { Link, useRoute, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavItem({ href, icon, children, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <div className={`flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${
        isActive 
          ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm" 
          : "text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
      }`}>
        {icon}
        {children}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const [isDashboardActive] = useRoute("/");
  const [isProjectsActive] = useRoute("/projects");
  const [isTeamMembersActive] = useRoute("/team-members");
  const [isReportsActive] = useRoute("/reports");
  const [isPerformanceActive] = useRoute("/performance");
  const [isSettingsActive] = useRoute("/settings");
  
  // Get the router's navigation function
  const [_, setLocation] = useLocation();
  
  // Get auth context for user data and logout
  const { user, refetchUser } = useAuth();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser navigation
    
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        // Refresh user data and redirect to login
        await refetchUser();
        setLocation("/login");
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-cyan-600">
          <h1 className="text-xl font-bold text-white">ISP Project Tracker</h1>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavItem 
              href="/" 
              icon={<LayoutDashboard className="mr-3 h-5 w-5" />}
              isActive={isDashboardActive}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/projects" 
              icon={<Network className="mr-3 h-5 w-5" />}
              isActive={isProjectsActive}
            >
              Projects
            </NavItem>
            <NavItem 
              href="/team-members" 
              icon={<Users className="mr-3 h-5 w-5" />}
              isActive={isTeamMembersActive}
            >
              Team Members
            </NavItem>
            <NavItem 
              href="/reports" 
              icon={<FileText className="mr-3 h-5 w-5" />}
              isActive={isReportsActive}
            >
              Reports
            </NavItem>
            <NavItem 
              href="/performance" 
              icon={<Award className="mr-3 h-5 w-5" />}
              isActive={isPerformanceActive}
            >
              Performance
            </NavItem>
            <NavItem 
              href="/settings" 
              icon={<Settings className="mr-3 h-5 w-5" />}
              isActive={isSettingsActive}
            >
              Settings
            </NavItem>
          </nav>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user ? user.name.substring(0, 2).toUpperCase() : '??'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">{user ? user.name : 'Loading...'}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Staff'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-slate-200"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
