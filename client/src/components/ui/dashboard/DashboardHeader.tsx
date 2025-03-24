import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlusIcon, SearchIcon } from "lucide-react";
import CreateProjectModal from "@/components/ui/projects/CreateProjectModal";
import { ProjectStage, ServiceType } from "@shared/schema";

interface DashboardHeaderProps {
  onSearch: (query: string) => void;
  onServiceTypeFilter: (type: string) => void;
  onStageFilter: (stage: string) => void;
}

export default function DashboardHeader({ 
  onSearch, 
  onServiceTypeFilter, 
  onStageFilter 
}: DashboardHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="mt-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            type="text"
            className="pl-10"
            placeholder="Search projects..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <Select onValueChange={onServiceTypeFilter} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Service Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Types</SelectItem>
              <SelectItem value={ServiceType.Fiber}>Fiber</SelectItem>
              <SelectItem value={ServiceType.Wireless}>Wireless</SelectItem>
            </SelectContent>
          </Select>
          
          <Select onValueChange={onStageFilter} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value={ProjectStage.Requirements.toString()}>Requirements</SelectItem>
              <SelectItem value={ProjectStage.Survey.toString()}>Survey</SelectItem>
              <SelectItem value={ProjectStage.Confirmation.toString()}>Confirmation</SelectItem>
              <SelectItem value={ProjectStage.Installation.toString()}>Installation</SelectItem>
              <SelectItem value={ProjectStage.Handover.toString()}>Handover</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
