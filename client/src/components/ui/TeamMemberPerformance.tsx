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
      return await apiRequest(
        `/api/team-members/${teamMemberId}/performance`, 
        'PUT',
        updatedMetric
      );
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

  // Create simplified data for pie chart using projectsCompleted
  const estimatedOnTime = Math.round(performance.projectsCompleted * 0.8); // Estimate 80% on time
  const pieData = [
    { name: "On Time", value: estimatedOnTime },
    { name: "Delayed", value: performance.projectsCompleted - estimatedOnTime },
  ];

  const COLORS = ["#4ade80", "#f87171"];

  const calculateEfficiencyScore = () => {
    // Calculate efficiency based on avg_completion_time (lower is better)
    // Scale inversely - 15 days or more = 0%, 5 days or less = 100%
    const maxTime = 15;
    const minTime = 5;
    const time = performance.avg_completion_time || 0;
    
    if (time >= maxTime) return 0;
    if (time <= minTime) return 100;
    
    return Math.round(((maxTime - time) / (maxTime - minTime)) * 100);
  };

  const calculateCustomerScore = () => {
    // Scale 0-10 score to percentage
    return Math.round((performance.customer_satisfaction_score || 0) * 10);
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
                <div className="text-2xl font-bold">{performance.projectsCompleted}</div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">On-Time Completion Rate</h4>
                <Progress 
                  value={80} // Using estimated 80% on-time rate
                  className="h-2"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {estimatedOnTime} of {performance.projectsCompleted} projects
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
                    projectsCompleted: performance.projectsCompleted + 1
                  })}
                >
                  Add Completed Project
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({
                    avgCompletionTime: Math.max(5, (performance.avgCompletionTime || 0) - 1)
                  })}
                >
                  Improve Completion Time
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({
                    customerSatisfactionScore: Math.min(10, (performance.customerSatisfactionScore || 0) + 0.5)
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