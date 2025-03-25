import React from "react";
import { format } from "date-fns";
import { BadgeType, TeamMemberBadge } from "@shared/schema";
import { getBadgeInfo } from "@/lib/badgeUtils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMemberBadgeProps {
  badge: TeamMemberBadge;
  showDate?: boolean;
}

export function TeamMemberBadgeComponent({ badge, showDate = true }: TeamMemberBadgeProps) {
  const badgeInfo = getBadgeInfo(badge.badgeType as BadgeType);
  const BadgeIcon = badgeInfo.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center p-2">
            <div className={`rounded-full p-3 ${badgeInfo.bgColor} mb-1`}>
              <BadgeIcon className={`h-5 w-5 ${badgeInfo.color}`} />
            </div>
            <Badge variant="outline" className={`text-xs ${badgeInfo.color}`}>
              {badgeInfo.label}
            </Badge>
            {showDate && badge.awardedAt && (
              <span className="text-xs text-gray-500 mt-1">
                {format(new Date(badge.awardedAt), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold">{badgeInfo.label}</p>
            <p className="text-sm">{badgeInfo.description}</p>
            {badge.reason && <p className="text-xs mt-1 italic">"{badge.reason}"</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}