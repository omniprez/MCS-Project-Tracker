import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TeamMemberBadge } from "@shared/schema";
import { TeamMemberBadgeComponent } from "@/components/ui/TeamMemberBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BadgeListProps {
  teamMemberId: number;
  compact?: boolean;
}

export function BadgeList({ teamMemberId, compact = false }: BadgeListProps) {
  const { data: badges, isLoading, error } = useQuery<TeamMemberBadge[]>({
    queryKey: ['/api/team-members', teamMemberId, 'badges'],
    enabled: !!teamMemberId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-16 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading badges</p>;
  }

  if (!badges?.length) {
    return <p className="text-gray-500 italic">No badges earned yet</p>;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <TeamMemberBadgeComponent 
            key={badge.id} 
            badge={badge} 
            showDate={false} 
          />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>Recognitions earned for exceptional work</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <TeamMemberBadgeComponent key={badge.id} badge={badge} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}