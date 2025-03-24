import { Link, useRoute } from "wouter";
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  FileText, 
  Settings,
  LogOut
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavItem({ href, icon, children, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <div className={`flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer ${
        isActive 
          ? "bg-primary text-white" 
          : "text-slate-700 hover:bg-slate-100"
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
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-primary">ISP Project Tracker</h1>
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
              href="#" 
              icon={<FileText className="mr-3 h-5 w-5" />}
            >
              Reports
            </NavItem>
            <NavItem 
              href="#" 
              icon={<Settings className="mr-3 h-5 w-5" />}
            >
              Settings
            </NavItem>
          </nav>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-700">JD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">John Doe</p>
              <p className="text-xs text-slate-500">Project Manager</p>
            </div>
          </div>
          <button className="text-slate-500 hover:text-slate-700">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
