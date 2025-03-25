import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MonthlyTeamPerformance } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  ComposedChart,
  Area 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthlyTeamPerformanceChart() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear].map(year => year.toString());
  }, []);

  const { data: performanceData, isLoading, error } = useQuery<MonthlyTeamPerformance[]>({
    queryKey: ['/api/performance/monthly', selectedYear],
    enabled: !!selectedYear,
  });

  const processedData = React.useMemo(() => {
    if (!performanceData) return [];

    // Create array with all 12 months 
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      // Find actual data for this month, or use default values
      const monthData = performanceData.find(item => item.month === i + 1) || {
        month: i + 1,
        year: parseInt(selectedYear),
        totalProjects: 0,
        completedProjects: 0,
        newCustomers: 0,
        avgProjectCompletionTime: 0,
        teamEfficiency: 0,
      };
      
      return {
        ...monthData,
        name: MONTHS[i],
        // Calculate completion rate
        completionRate: monthData.totalProjects 
          ? (monthData.completedProjects / monthData.totalProjects) * 100 
          : 0,
      };
    });

    return allMonths;
  }, [performanceData, selectedYear]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading team performance data</p>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Team Performance</CardTitle>
            <CardDescription>Performance metrics across months</CardDescription>
          </div>
          <Select
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={processedData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalProjects" fill="#8884d8" name="Total Projects" />
                <Bar yAxisId="left" dataKey="completedProjects" fill="#82ca9d" name="Completed Projects" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="teamEfficiency"
                  stroke="#ff7300"
                  name="Team Efficiency"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processedData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  stroke="#8884d8"
                  name="New Customers"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgProjectCompletionTime"
                  stroke="#82ca9d"
                  name="Avg Completion Time (days)"
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#ffc658"
                  name="Completion Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}