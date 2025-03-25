import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PerformanceMetric } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";

interface TeamMemberPerformanceProps {
  teamMemberId: number;
  isEditable?: boolean;
}

export function TeamMemberPerformance({ teamMemberId, isEditable = false }: TeamMemberPerformanceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: performance, isLoading, error } = useQuery<PerformanceMetric>({
    queryKey: ['/api/team-members', teamMemberId, 'performance'],
    enabled: !!teamMemberId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedMetric: Partial<PerformanceMetric>) => {
      return await apiRequest<PerformanceMetric>(`/api/team-members/${teamMemberId}/performance`, {
        method: "PUT",
        body: JSON.stringify(updatedMetric),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members', teamMemberId, 'performance'] });
      toast({
        title: "Performance metrics updated",
        description: "The performance metrics have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the performance metrics",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-[250px]" />
          <Skeleton className="h-5 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading performance metrics</p>;
  }

  if (!performance) {
    return <p className="text-gray-500 italic">No performance metrics available</p>;
  }

  const pieData = [
    { name: "On Time", value: performance.projectsCompletedOnTime },
    { name: "Delayed", value: performance.totalProjectsCompleted - performance.projectsCompletedOnTime },
  ];

  const COLORS = ["#4ade80", "#f87171"];

  const calculateEfficiencyScore = () => {
    return Math.round((performance.resourceEfficiencyScore || 0) * 100);
  };

  const calculateCustomerScore = () => {
    return Math.round((performance.customerSatisfactionScore || 0) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Key performance indicators based on completed projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Projects Completed</h4>
                <div className="text-2xl font-bold">{performance.totalProjectsCompleted}</div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">On-Time Completion Rate</h4>
                <Progress 
                  value={performance.totalProjectsCompleted > 0 
                    ? (performance.projectsCompletedOnTime / performance.totalProjectsCompleted) * 100
                    : 0
                  } 
                  className="h-2"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {performance.projectsCompletedOnTime} of {performance.totalProjectsCompleted} projects
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Resource Efficiency</h4>
                <Progress value={calculateEfficiencyScore()} className="h-2" />
                <div className="text-sm text-gray-500 mt-1">
                  {calculateEfficiencyScore()}% efficiency score
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Customer Satisfaction</h4>
                <Progress value={calculateCustomerScore()} className="h-2" />
                <div className="text-sm text-gray-500 mt-1">
                  {calculateCustomerScore()}% satisfaction rate
                </div>
              </div>
            </div>

            <div className="h-64">
              <h4 className="text-sm font-medium mb-2 text-center">Project Completion</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {isEditable && (
            <div>
              <h4 className="text-sm font-medium mb-4">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({
                    totalProjectsCompleted: performance.totalProjectsCompleted + 1,
                    projectsCompletedOnTime: performance.projectsCompletedOnTime + 1
                  })}
                >
                  Add On-Time Project
                </Button>

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({
                    totalProjectsCompleted: performance.totalProjectsCompleted + 1
                  })}
                >
                  Add Delayed Project
                </Button>

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({
                    resourceEfficiencyScore: Math.min(1, (performance.resourceEfficiencyScore || 0) + 0.05)
                  })}
                >
                  Increase Efficiency
                </Button>

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({
                    customerSatisfactionScore: Math.min(1, (performance.customerSatisfactionScore || 0) + 0.05)
                  })}
                >
                  Increase Satisfaction
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}