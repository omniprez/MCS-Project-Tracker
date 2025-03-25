import { BadgeType } from "@shared/schema";
import { 
  Award, 
  Clock, 
  Heart, 
  Users, 
  Flag, 
  FlagTriangleRight, 
  Mountain, 
  Star, 
  Timer, 
  Sparkles 
} from "lucide-react";

export const badges = {
  [BadgeType.SpeedDemon]: {
    label: "Speed Demon",
    description: "Completed projects ahead of schedule",
    icon: Clock,
    color: "text-purple-500",
    bgColor: "bg-purple-100"
  },
  [BadgeType.TechWizard]: {
    label: "Tech Wizard",
    description: "Resolved complex technical issues",
    icon: Sparkles,
    color: "text-blue-500",
    bgColor: "bg-blue-100"
  },
  [BadgeType.CustomerWhisperer]: {
    label: "Customer Whisperer",
    description: "Excellent customer satisfaction",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-100"
  },
  [BadgeType.TeamPlayer]: {
    label: "Team Player",
    description: "Helped team members succeed",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-100"
  },
  [BadgeType.FirstMile]: {
    label: "First Mile",
    description: "First project completion milestone",
    icon: Flag,
    color: "text-red-500",
    bgColor: "bg-red-100"
  },
  [BadgeType.FifthMile]: {
    label: "Fifth Mile",
    description: "Five projects completed milestone",
    icon: FlagTriangleRight,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100"
  },
  [BadgeType.TenthMile]: {
    label: "Tenth Mile",
    description: "Ten projects completed milestone",
    icon: Mountain,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100"
  },
  [BadgeType.PerfectScore]: {
    label: "Perfect Score",
    description: "Completed a project with no issues",
    icon: Star,
    color: "text-amber-500",
    bgColor: "bg-amber-100"
  },
  [BadgeType.OnTime]: {
    label: "On Time",
    description: "Consistently completed projects on time",
    icon: Timer,
    color: "text-cyan-500",
    bgColor: "bg-cyan-100"
  },
  [BadgeType.EfficiencyExpert]: {
    label: "Efficiency Expert",
    description: "Completed projects with minimal resources",
    icon: Award,
    color: "text-emerald-500", 
    bgColor: "bg-emerald-100"
  }
};

export function getBadgeInfo(type: BadgeType) {
  return badges[type] || {
    label: "Unknown Badge",
    description: "Badge details not found",
    icon: Award,
    color: "text-gray-500",
    bgColor: "bg-gray-100"
  };
}