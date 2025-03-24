import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectStage, ServiceType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, DownloadIcon, FileTextIcon, BarChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStageInfo } from "@/lib/stageUtils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const [reportType, setReportType] = useState<"projects" | "stages" | "service">("projects");
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");
  
  // Fetch projects for reports
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects'],
  });
  
  // Fetch stage statistics for reports
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Calculate project statistics
  const projectsByStage = projects.reduce((acc, project) => {
    const stage = project.currentStage;
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<ProjectStage, number>);
  
  const projectsByService = projects.reduce((acc, project) => {
    const service = project.serviceType;
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data
  const stageChartData = Object.entries(projectsByStage).map(([stage, count]) => {
    const stageInfo = getStageInfo(Number(stage) as ProjectStage);
    return {
      name: stageInfo.label,
      value: count
    };
  });

  const serviceChartData = Object.entries(projectsByService).map(([service, count]) => {
    return {
      name: service === ServiceType.Fiber ? "Fiber" : "Wireless",
      value: count
    };
  });

  const statusChartData = [
    { name: "Completed", value: projects.filter(p => p.isCompleted).length },
    { name: "In Progress", value: projects.filter(p => !p.isCompleted).length }
  ];

  // Dynamic report content based on selection
  const renderReportContent = () => {
    switch (reportType) {
      case "projects":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
                <CardDescription>Distribution of projects by their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Completion Timeline</CardTitle>
                <CardDescription>Expected completion dates of active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects
                    .filter(p => !p.isCompleted)
                    .sort((a, b) => new Date(a.expectedCompletion).getTime() - new Date(b.expectedCompletion).getTime())
                    .slice(0, 5)
                    .map((project) => (
                      <div key={project.id} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <p className="font-medium">{project.projectId}: {project.customerName}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{new Date(project.expectedCompletion).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant={getStageInfo(project.currentStage).bgColor as any}>
                          {getStageInfo(project.currentStage).label}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "stages":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Stages Distribution</CardTitle>
                <CardDescription>Number of projects in each stage of the workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stageChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Projects" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stage Transition Analysis</CardTitle>
                <CardDescription>Average time spent in each project stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Requirements", days: "4" },
                    { name: "Survey", days: "6" },
                    { name: "Confirmation", days: "3" },
                    { name: "Installation", days: "12" },
                    { name: "Handover", days: "5" }
                  ].map((stage) => (
                    <div key={stage.name} className="flex justify-between items-center border-b pb-3">
                      <p className="font-medium">{stage.name}</p>
                      <div className="flex items-center">
                        <p className="font-medium">{stage.days} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "service":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
                <CardDescription>Breakdown of projects by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Bandwidth by Service Type</CardTitle>
                <CardDescription>Average bandwidth provisioned for each service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(ServiceType).map((serviceType) => {
                    const serviceProjects = projects.filter(p => p.serviceType === serviceType);
                    const avgBandwidth = serviceProjects.length 
                      ? serviceProjects.reduce((sum, p) => sum + p.bandwidth, 0) / serviceProjects.length
                      : 0;
                    
                    return (
                      <div key={serviceType} className="flex justify-between items-center border-b pb-3">
                        <p className="font-medium">{serviceType === ServiceType.Fiber ? "Fiber" : "Wireless"}</p>
                        <div className="flex items-center">
                          <p className="font-medium">{avgBandwidth.toFixed(0)} Mbps</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze project metrics and performance indicators
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select defaultValue={dateRange} onValueChange={(value) => setDateRange(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="projects" className="space-y-4" onValueChange={(value) => setReportType(value as any)}>
        <TabsList>
          <TabsTrigger value="projects" className="flex items-center">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Project Status
          </TabsTrigger>
          <TabsTrigger value="stages" className="flex items-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Workflow Stages
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Service Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-4">
          {renderReportContent()}
        </TabsContent>
        
        <TabsContent value="stages" className="space-y-4">
          {renderReportContent()}
        </TabsContent>
        
        <TabsContent value="service" className="space-y-4">
          {renderReportContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}