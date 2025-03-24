import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopNavbarProps {
  onMenuClick: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
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
          <button type="button" className="rounded-full p-1 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white">
            <Bell className="h-6 w-6" />
          </button>
          <div className="relative ml-3">
            <div>
              <button type="button" className="flex max-w-xs items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">JD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
