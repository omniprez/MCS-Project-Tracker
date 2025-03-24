import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile sidebar using Sheet component */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile top navbar */}
        <TopNavbar onMenuClick={() => setIsMenuOpen(true)} />
        
        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
