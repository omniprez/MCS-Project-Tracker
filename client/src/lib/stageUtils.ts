import { ProjectStage } from "@shared/schema";

export function getStageInfo(stage: ProjectStage) {
  switch (stage) {
    case ProjectStage.Requirements:
      return {
        label: "Requirements",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-700",
        barColor: "bg-indigo-600"
      };
    case ProjectStage.Survey:
      return {
        label: "Survey",
        bgColor: "bg-violet-100",
        textColor: "text-violet-700",
        barColor: "bg-violet-600"
      };
    case ProjectStage.Confirmation:
      return {
        label: "Confirmation",
        bgColor: "bg-fuchsia-100",
        textColor: "text-fuchsia-700",
        barColor: "bg-fuchsia-600"
      };
    case ProjectStage.Installation:
      return {
        label: "Installation",
        bgColor: "bg-cyan-100",
        textColor: "text-cyan-700",
        barColor: "bg-cyan-600"
      };
    case ProjectStage.Handover:
      return {
        label: "Handover",
        bgColor: "bg-teal-100",
        textColor: "text-teal-700",
        barColor: "bg-teal-600"
      };
    default:
      return {
        label: "Unknown",
        bgColor: "bg-slate-100",
        textColor: "text-slate-700",
        barColor: "bg-slate-600"
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
