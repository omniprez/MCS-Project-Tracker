import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/ui/projects/ProjectCard";
import { Project } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectListProps {
  searchQuery: string;
  serviceTypeFilter: string;
  stageFilter: string;
}

export default function ProjectList({
  searchQuery,
  serviceTypeFilter,
  stageFilter
}: ProjectListProps) {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<string>("active");

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['/api/projects'],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  useEffect(() => {
    if (!projects) return;

    let filtered = [...projects];

    // Filter by active tab
    if (activeTab === "active") {
      filtered = filtered.filter(project => !project.isCompleted);
    } else if (activeTab === "completed") {
      filtered = filtered.filter(project => project.isCompleted);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by service type
    if (serviceTypeFilter && serviceTypeFilter !== "all") {
      filtered = filtered.filter(project => project.serviceType === serviceTypeFilter);
    }

    // Filter by stage
    if (stageFilter && stageFilter !== "all") {
      filtered = filtered.filter(project => project.currentStage === Number(stageFilter));
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, serviceTypeFilter, stageFilter, activeTab]);

  const renderSkeletons = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="overflow-hidden bg-white shadow sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-24 rounded-full" />
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full mb-4" />
            </div>
            <div className="mt-4 flex justify-between">
              <Skeleton className="h-4 w-48" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Tabs 
        defaultValue="active" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6 w-full border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger 
            value="active" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Active Projects
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Completed Projects
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            All Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0">
          {isLoading ? (
            renderSkeletons()
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-slate-600">No active projects found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {isLoading ? (
            renderSkeletons()
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-slate-600">No completed projects found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            renderSkeletons()
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-slate-600">No projects found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
