import { useState } from "react";
import DashboardHeader from "@/components/ui/dashboard/DashboardHeader";
import ProjectList from "@/components/ui/dashboard/ProjectList";

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  
  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
        <p className="text-slate-600 mt-1">Manage all customer projects</p>
      </div>
      <DashboardHeader 
        onSearch={setSearchQuery}
        onServiceTypeFilter={setServiceTypeFilter}
        onStageFilter={setStageFilter}
      />
      <ProjectList 
        searchQuery={searchQuery}
        serviceTypeFilter={serviceTypeFilter}
        stageFilter={stageFilter}
      />
    </>
  );
}
