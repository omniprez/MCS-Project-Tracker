import { FileTextIcon, MapPinIcon, ThumbsUpIcon, WrenchIcon, CheckCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectStage } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface StageCardProps {
  icon: React.ReactNode;
  stage: string;
  count: number;
  bgColor: string;
  textColor: string;
}

function StageCard({ icon, stage, count, bgColor, textColor }: StageCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full ${bgColor} ${textColor}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-slate-500">{stage}</p>
            <p className="text-2xl font-semibold">{count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectStageSummary() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const stageConfigs = [
    {
      stage: ProjectStage.Requirements,
      name: "Requirements",
      icon: <FileTextIcon className="h-6 w-6" />,
      bgColor: "bg-blue-100",
      textColor: "text-primary"
    },
    {
      stage: ProjectStage.Survey,
      name: "Survey",
      icon: <MapPinIcon className="h-6 w-6" />,
      bgColor: "bg-violet-100",
      textColor: "text-secondary"
    },
    {
      stage: ProjectStage.Confirmation,
      name: "Confirmation",
      icon: <ThumbsUpIcon className="h-6 w-6" />,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"
    },
    {
      stage: ProjectStage.Installation,
      name: "Installation",
      icon: <WrenchIcon className="h-6 w-6" />,
      bgColor: "bg-cyan-100",
      textColor: "text-accent"
    },
    {
      stage: ProjectStage.Handover,
      name: "Handover",
      icon: <CheckCircleIcon className="h-6 w-6" />,
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Skeleton className="mr-4 h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stageConfigs.map((config) => (
        <StageCard
          key={config.stage}
          icon={config.icon}
          stage={config.name}
          count={stats?.stageStats?.[config.stage] || 0}
          bgColor={config.bgColor}
          textColor={config.textColor}
        />
      ))}
    </div>
  );
}
