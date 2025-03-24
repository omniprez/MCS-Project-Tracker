import { useState } from "react";
import DashboardHeader from "@/components/ui/dashboard/DashboardHeader";
import ProjectStageSummary from "@/components/ui/dashboard/ProjectStageSummary";
import ProjectList from "@/components/ui/dashboard/ProjectList";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  
  return (
    <>
      <DashboardHeader 
        onSearch={setSearchQuery}
        onServiceTypeFilter={setServiceTypeFilter}
        onStageFilter={setStageFilter}
      />
      <ProjectStageSummary />
      <ProjectList 
        searchQuery={searchQuery}
        serviceTypeFilter={serviceTypeFilter}
        stageFilter={stageFilter}
      />
    </>
  );
}
