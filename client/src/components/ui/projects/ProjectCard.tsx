import { Project, ProjectStage, ServiceType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, PaperclipIcon, Wifi, Network } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getStageInfo, getStagePercentage } from "@/lib/stageUtils";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showDocuments, setShowDocuments] = useState(false);
  
  const { data: teamMembers } = useQuery({
    queryKey: ['/api/team-members'],
  });
  
  const stageInfo = getStageInfo(project.currentStage);
  const completionPercentage = getStagePercentage(project.currentStage);
  const formattedDate = format(new Date(project.createdAt), "MMM dd, yyyy");
  
  const assignedTeamMember = teamMembers?.find(tm => tm.id === project.assignedTo);
  
  return (
    <Card className="overflow-hidden bg-white shadow sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900">
              {project.customerName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {project.projectId}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${
              project.serviceType === ServiceType.Fiber 
                ? "bg-green-100 text-green-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {project.serviceType === ServiceType.Fiber ? (
                <Network className="mr-1 h-4 w-4" />
              ) : (
                <Wifi className="mr-1 h-4 w-4" />
              )}
              {project.serviceType === ServiceType.Fiber ? "Fiber" : "Wireless"}
            </span>
            <div className="text-right">
              <p className="text-sm text-slate-500">Created</p>
              <p className="text-sm font-medium">{formattedDate}</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${stageInfo.bgColor} ${stageInfo.textColor}`}>
                  Stage {project.currentStage}: {stageInfo.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-600">
                  {completionPercentage}% Complete
                </span>
              </div>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded bg-slate-200">
              <div 
                className={`h-2 rounded ${stageInfo.barColor}`} 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Requirements</span>
              <span>Survey</span>
              <span>Confirmation</span>
              <span>Installation</span>
              <span>Handover</span>
            </div>
          </div>
        </div>
        
        {/* Card Footer */}
        <div className="mt-4 flex justify-between">
          <div className="flex items-center">
            <div className="text-sm text-slate-500">
              <span>Assigned to:</span>
              <span className="font-medium ml-1">
                {assignedTeamMember?.name || "Unassigned"}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDocuments(!showDocuments)}
            >
              <PaperclipIcon className="mr-1 h-4 w-4" /> Documents
            </Button>
            <Button size="sm">
              <Edit className="mr-1 h-4 w-4" /> Update
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
