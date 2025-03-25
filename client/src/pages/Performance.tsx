import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeamMember, TeamMemberRole } from "@shared/schema";
import { MonthlyTeamPerformanceChart } from "@/components/ui/MonthlyTeamPerformance";
import { TeamMemberCard } from "@/components/ui/TeamMemberCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

export default function Performance() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  // Determine if current user can award badges (based on role or admin status)
  const canAwardBadges = user?.role === TeamMemberRole.ProjectManager || user?.isAdmin;

  const filteredTeamMembers = selectedRole === "all" 
    ? teamMembers 
    : teamMembers?.filter(member => member.role === selectedRole);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>

      <MonthlyTeamPerformanceChart />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>

          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.values(TeamMemberRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeamMembers?.map((teamMember) => (
            <TeamMemberCard 
              key={teamMember.id} 
              teamMember={teamMember} 
              canAwardBadges={canAwardBadges} 
            />
          ))}

          {filteredTeamMembers?.length === 0 && (
            <p className="text-gray-500 col-span-3 text-center py-8">
              No team members found for the selected role.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}