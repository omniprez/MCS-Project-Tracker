import { ProjectStage } from "@shared/schema";

export function getStageInfo(stage: ProjectStage) {
  switch (stage) {
    case ProjectStage.Requirements:
      return {
        label: "Requirements",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        barColor: "bg-primary"
      };
    case ProjectStage.Survey:
      return {
        label: "Survey",
        bgColor: "bg-violet-100",
        textColor: "text-violet-800",
        barColor: "bg-secondary"
      };
    case ProjectStage.Confirmation:
      return {
        label: "Confirmation",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        barColor: "bg-yellow-500"
      };
    case ProjectStage.Installation:
      return {
        label: "Installation",
        bgColor: "bg-cyan-100",
        textColor: "text-cyan-800",
        barColor: "bg-accent"
      };
    case ProjectStage.Handover:
      return {
        label: "Handover",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        barColor: "bg-green-600"
      };
    default:
      return {
        label: "Unknown",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        barColor: "bg-gray-500"
      };
  }
}

export function getStagePercentage(stage: ProjectStage): number {
  switch (stage) {
    case ProjectStage.Requirements:
      return 20;
    case ProjectStage.Survey:
      return 40;
    case ProjectStage.Confirmation:
      return 60;
    case ProjectStage.Installation:
      return 80;
    case ProjectStage.Handover:
      return 100;
    default:
      return 0;
  }
}
