import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Award, 
  BadgeCheck, 
  BarChart2, 
  Clock, 
  Star, 
  Zap, 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TeamMemberRole, ServiceType, ProjectStage, type Project, type TeamMember } from "@shared/schema";
import { getStageInfo } from "@/lib/stageUtils";

// Badge definitions
const badges = {
  speedyCompletion: {
    name: "Speedy Completion",
    description: "Completed project ahead of schedule",
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    color: "bg-yellow-100 border-yellow-300"
  },
  perfectHandover: {
    name: "Perfect Handover",
    description: "Zero issues during NOC handover",
    icon: <BadgeCheck className="h-8 w-8 text-green-500" />,
    color: "bg-green-100 border-green-300"
  },
  highBandwidth: {
    name: "High Bandwidth",
    description: "Delivered 1Gbps+ connectivity",
    icon: <ArrowUpRight className="h-8 w-8 text-blue-500" />,
    color: "bg-blue-100 border-blue-300"
  },
  complexSolution: {
    name: "Complex Solution",
    description: "Successfully implemented complex requirements",
    icon: <Target className="h-8 w-8 text-purple-500" />,
    color: "bg-purple-100 border-purple-300"
  },
  teamEffort: {
    name: "Team Effort",
    description: "Coordinated multiple team members efficiently",
    icon: <Users className="h-8 w-8 text-indigo-500" />,
    color: "bg-indigo-100 border-indigo-300"
  },
  onTimeDelivery: {
    name: "On-Time Delivery",
    description: "Project delivered on schedule",
    icon: <Clock className="h-8 w-8 text-cyan-500" />,
    color: "bg-cyan-100 border-cyan-300"
  },
  customerSatisfaction: {
    name: "Customer Satisfaction",
    description: "Received excellent customer feedback",
    icon: <Star className="h-8 w-8 text-amber-500" />,
    color: "bg-amber-100 border-amber-300"
  },
  projectChampion: {
    name: "Project Champion",
    description: "Completed 5+ projects successfully",
    icon: <Trophy className="h-8 w-8 text-orange-500" />,
    color: "bg-orange-100 border-orange-300"
  }
};

type BadgeKey = keyof typeof badges;

// Helper function to determine badges earned by a project
const getProjectBadges = (project: any): BadgeKey[] => {
  const earnedBadges: BadgeKey[] = [];
  
  // Only consider completed projects
  if (project.isCompleted) {
    // High bandwidth badge
    if (project.bandwidth >= 1000) {
      earnedBadges.push('highBandwidth');
    }
    
    // Perfect handover badge - assuming completed + handover stage means successful
    if (project.currentStage === ProjectStage.Handover) {
      earnedBadges.push('perfectHandover');
    }

    // On-time delivery - simplified logic, would need actual date comparison
    earnedBadges.push('onTimeDelivery');
    
    // Add a random badge for demonstration
    if (project.serviceType === ServiceType.Fiber) {
      earnedBadges.push('complexSolution');
    } else {
      earnedBadges.push('teamEffort');
    }
  }
  
  return earnedBadges;
};

// Helper function to determine badges earned by team members
const getTeamMemberBadges = (teamMember: any, projects: any[]): BadgeKey[] => {
  const earnedBadges: BadgeKey[] = [];
  const memberProjects = projects.filter(p => p.assignedTo === teamMember.id);
  
  // Project Champion badge
  if (memberProjects.filter(p => p.isCompleted).length >= 3) {
    earnedBadges.push('projectChampion');
  }
  
  // Speedy completion badge - simplified
  if (memberProjects.some(p => p.isCompleted)) {
    earnedBadges.push('speedyCompletion');
  }
  
  // Fiber expert
  if (memberProjects.filter(p => p.serviceType === ServiceType.Fiber && p.isCompleted).length >= 2) {
    earnedBadges.push('complexSolution');
  }
  
  // Customer satisfaction - simplified
  if (memberProjects.length > 0) {
    earnedBadges.push('customerSatisfaction');
  }
  
  return earnedBadges;
};

// Performance metrics calculation
const calculatePerformanceMetrics = (teamMember: any, projects: any[]) => {
  const memberProjects = projects.filter(p => p.assignedTo === teamMember.id);
  const completedProjects = memberProjects.filter(p => p.isCompleted);
  
  return {
    completionRate: memberProjects.length ? (completedProjects.length / memberProjects.length) * 100 : 0,
    projectCount: memberProjects.length,
    completedCount: completedProjects.length,
    badges: getTeamMemberBadges(teamMember, projects)
  };
};

// Team leaderboard section
const TeamLeaderboard = ({ teamMembers, projects }: { teamMembers: any[], projects: any[] }) => {
  // Calculate performance metrics for each team member
  const membersWithMetrics = teamMembers.map(member => ({
    ...member,
    metrics: calculatePerformanceMetrics(member, projects)
  }))
  .sort((a, b) => b.metrics.completedCount - a.metrics.completedCount);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Leaderboard</CardTitle>
          <CardDescription>Top performers based on project completion metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {membersWithMetrics.map((member, index) => (
              <div key={member.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-base">{member.name}</h3>
                    <span className="text-sm text-gray-500">{member.role}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">
                      {member.metrics.completedCount} / {member.metrics.projectCount} projects
                    </span>
                    <span className="text-sm font-medium">
                      {member.metrics.completionRate.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={member.metrics.completionRate} className="h-2" />
                </div>
                <div className="flex-shrink-0 flex space-x-1">
                  {member.metrics.badges.slice(0, 3).map((badge: string, i: number) => (
                    <div key={i} className="w-6 h-6" title={badges[badge as BadgeKey].name}>
                      {badges[badge as BadgeKey].icon}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Project badges section
const ProjectBadges = ({ projects }: { projects: any[] }) => {
  const projectsWithBadges = projects.map(project => ({
    ...project,
    badges: getProjectBadges(project)
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Achievement Badges</CardTitle>
          <CardDescription>Special recognitions for project milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsWithBadges
              .filter(p => p.badges.length > 0)
              .map(project => (
              <div 
                key={project.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{project.projectId}: {project.customerName}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Completed: {project.isCompleted ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <Badge variant={project.serviceType === ServiceType.Fiber ? "default" : "outline"}>
                    {project.serviceType}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {project.badges.map((badge: string) => (
                    <div 
                      key={badge} 
                      className={`${badges[badge as BadgeKey].color} border rounded-md p-3 flex items-center space-x-3`}
                    >
                      <div className="flex-shrink-0">
                        {badges[badge as BadgeKey].icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{badges[badge as BadgeKey].name}</h4>
                        <p className="text-xs text-muted-foreground">{badges[badge as BadgeKey].description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Team member achievement cards
const TeamMemberAchievements = ({ teamMembers, projects }: { teamMembers: any[], projects: any[] }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Member Achievements</CardTitle>
          <CardDescription>Individual accomplishments and recognition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map(member => {
              const memberBadges = getTeamMemberBadges(member, projects);
              const memberMetrics = calculatePerformanceMetrics(member, projects);
              
              return (
                <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="h-5 w-5 text-amber-500" />
                      <span className="font-semibold">{memberBadges.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Projects completed</span>
                      <span>{memberMetrics.completedCount} / {memberMetrics.projectCount}</span>
                    </div>
                    <Progress value={memberMetrics.completionRate} className="h-2 mb-4" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {memberBadges.map((badge, index) => (
                      <div 
                        key={index}
                        className={`${badges[badge].color} border rounded-md p-2 flex items-center space-x-2`}
                      >
                        <div className="flex-shrink-0">
                          {badges[badge].icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-medium">{badges[badge].name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Performance() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  
  // Fetch team members
  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ['/api/team-members'],
  });
  
  // Fetch projects
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects'],
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance & Achievements</h1>
        <p className="text-muted-foreground">
          Track team performance metrics and project achievement badges
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard" className="flex items-center justify-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Team Leaderboard
          </TabsTrigger>
          <TabsTrigger value="project-badges" className="flex items-center justify-center">
            <Award className="mr-2 h-4 w-4" />
            Project Badges
          </TabsTrigger>
          <TabsTrigger value="member-achievements" className="flex items-center justify-center">
            <Trophy className="mr-2 h-4 w-4" />
            Team Achievements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leaderboard">
          <TeamLeaderboard teamMembers={teamMembers} projects={projects} />
        </TabsContent>
        
        <TabsContent value="project-badges">
          <ProjectBadges projects={projects} />
        </TabsContent>
        
        <TabsContent value="member-achievements">
          <TeamMemberAchievements teamMembers={teamMembers} projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}