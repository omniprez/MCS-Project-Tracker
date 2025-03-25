import React from "react";
import { TeamMember, BadgeType, TeamMemberRole } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeList } from "@/components/ui/BadgeList";
import { TeamMemberPerformanceDialog } from "@/components/ui/TeamMemberPerformanceDialog";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface TeamMemberCardProps {
  teamMember: TeamMember;
  canAwardBadges?: boolean;
}

function getRoleColor(role: TeamMemberRole) {
  switch (role) {
    case TeamMemberRole.ProjectManager:
      return "bg-blue-100 text-blue-800";
    case TeamMemberRole.NetworkEngineer:
      return "bg-green-100 text-green-800";
    case TeamMemberRole.FieldTechnician:
      return "bg-orange-100 text-orange-800";
    case TeamMemberRole.SalesRepresentative:
      return "bg-purple-100 text-purple-800";
    case TeamMemberRole.NOCEngineer:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function TeamMemberCard({ teamMember, canAwardBadges = false }: TeamMemberCardProps) {
  const { data: badges } = useQuery({
    queryKey: ['/api/team-members', teamMember.id, 'badges'],
    enabled: !!teamMember.id,
  });

  const badgeCount = badges?.length || 0;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(teamMember.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{teamMember.name}</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className={getRoleColor(teamMember.role as TeamMemberRole)}>
                  {teamMember.role}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mt-2 text-sm text-gray-500">
          <div className="flex items-center justify-between mb-2">
            <span>Email:</span>
            <span className="font-medium text-gray-700">{teamMember.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Badges:</span>
            <span className="font-medium text-gray-700">{badgeCount}</span>
          </div>
        </div>
        
        {badgeCount > 0 && (
          <div className="mt-4">
            <BadgeList teamMemberId={teamMember.id} compact />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <TeamMemberPerformanceDialog 
          teamMember={teamMember} 
          canAwardBadges={canAwardBadges} 
        />
      </CardFooter>
    </Card>
  );
}