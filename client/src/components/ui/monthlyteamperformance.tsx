import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MonthlyTeamPerformance } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface PerformanceChartProps {
  data: MonthlyTeamPerformance[];
}

export function MonthlyTeamPerformanceChart() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
  const [activeTab, setActiveTab] = useState("projects");

  const { data: performanceData, isLoading, error } = useQuery<MonthlyTeamPerformance[]>({
    queryKey: ['/api/performance/monthly', selectedYear],
    enabled: !!selectedYear,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-[250px]" />
          <Skeleton className="h-5 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading performance data</p>;
  }

  const chartData = performanceData?.length
    ? MONTHS.map((month, index) => {
        const monthData = performanceData.find(p => p.month === index + 1) || {
          month: index + 1,
          year: parseInt(selectedYear),
          projectsCompleted: 0,
          projectsOnSchedule: 0,
          averageCustomerSatisfaction: 0,
          resourceUtilization: 0,
          teamEfficiency: 0,
          revenue: 0,
          costs: 0
        };

        return {
          name: month.substring(0, 3),
          ...monthData,
          profit: (monthData.revenue || 0) - (monthData.costs || 0)
        };
      })
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Monthly performance metrics for the team</CardDescription>
          </div>
          <Select
            value={selectedYear.toString()}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="projectsCompleted" name="Total Projects" fill="#4f46e5" />
                <Bar dataKey="projectsOnSchedule" name="On Schedule" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="efficiency" className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="resourceUtilization" 
                  name="Resource Utilization" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="teamEfficiency" 
                  name="Team Efficiency" 
                  stroke="#06b6d4" 
                  fill="#06b6d4"
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="satisfaction" className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="averageCustomerSatisfaction" 
                  name="Customer Satisfaction" 
                  stroke="#ec4899" 
                  fill="#ec4899"
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="financial" className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#4ade80" />
                <Bar dataKey="costs" name="Costs" fill="#f87171" />
                <Bar dataKey="profit" name="Profit" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}