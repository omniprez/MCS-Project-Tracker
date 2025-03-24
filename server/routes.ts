import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertTaskSchema, 
  insertProjectStageHistorySchema,
  insertTeamMemberSchema,
  ProjectStage,
  ServiceType
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Get all projects
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  // Get project by ID
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });
  
  // Create new project
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating project" });
    }
  });
  
  // Update project
  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updatedProject = await storage.updateProject(id, req.body);
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Error updating project" });
    }
  });
  
  // Update project stage
  app.post("/api/projects/:id/stage", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const { stage, notes, changedBy } = req.body;
      
      // Validate stage
      if (!Object.values(ProjectStage).includes(stage)) {
        return res.status(400).json({ message: "Invalid stage value" });
      }
      
      // Update project stage
      const updatedProject = await storage.updateProjectStage(id, stage);
      
      if (!updatedProject) {
        return res.status(400).json({ message: "Cannot update project stage" });
      }
      
      // Record stage history
      const stageHistoryData = insertProjectStageHistorySchema.parse({
        projectId: id,
        stage,
        notes,
        changedBy
      });
      
      await storage.createStageHistory(stageHistoryData);
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating project stage" });
    }
  });
  
  // Get projects by stage
  app.get("/api/projects/stage/:stage", async (req: Request, res: Response) => {
    try {
      const stage = parseInt(req.params.stage);
      
      if (!Object.values(ProjectStage).includes(stage)) {
        return res.status(400).json({ message: "Invalid stage value" });
      }
      
      const projects = await storage.getProjectsByStage(stage);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  // Get projects by service type
  app.get("/api/projects/service/:type", async (req: Request, res: Response) => {
    try {
      const type = req.params.type as ServiceType;
      
      if (!Object.values(ServiceType).includes(type)) {
        return res.status(400).json({ message: "Invalid service type" });
      }
      
      const projects = await storage.getProjectsByServiceType(type);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  // Get active/completed projects
  app.get("/api/projects/status/:status", async (req: Request, res: Response) => {
    try {
      const isCompleted = req.params.status === "completed";
      const projects = await storage.getProjectsByStatus(isCompleted);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  // Search projects
  app.get("/api/projects/search/:query", async (req: Request, res: Response) => {
    try {
      const query = req.params.query;
      const projects = await storage.searchProjects(query);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error searching projects" });
    }
  });
  
  // Get team members
  app.get("/api/team-members", async (req: Request, res: Response) => {
    try {
      const teamMembers = await storage.getAllTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching team members" });
    }
  });
  
  // Create team member
  app.post("/api/team-members", async (req: Request, res: Response) => {
    try {
      const teamMemberData = insertTeamMemberSchema.parse(req.body);
      const teamMember = await storage.createTeamMember(teamMemberData);
      res.status(201).json(teamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team member data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating team member" });
    }
  });
  
  // Get team member by ID
  app.get("/api/team-members/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const teamMember = await storage.getTeamMemberById(id);
      
      if (!teamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(teamMember);
    } catch (error) {
      res.status(500).json({ message: "Error fetching team member" });
    }
  });
  
  // Get project documents
  app.get("/api/projects/:id/documents", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const documents = await storage.getDocumentsByProjectId(id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  
  // Get project stage history
  app.get("/api/projects/:id/history", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const history = await storage.getStageHistoryByProjectId(id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stage history" });
    }
  });
  
  // Create task for project
  app.post("/api/projects/:id/tasks", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        projectId
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating task" });
    }
  });
  
  // Get project tasks
  app.get("/api/projects/:id/tasks", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const tasks = await storage.getTasksByProjectId(id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  // Update task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTask = await storage.updateTask(id, req.body);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task" });
    }
  });
  
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const projectsByStage = await storage.getProjectCountByStage();
      
      const activeProjects = await storage.getProjectsByStatus(false);
      const completedProjects = await storage.getProjectsByStatus(true);
      
      const stats = {
        stageStats: projectsByStage,
        activeCount: activeProjects.length,
        completedCount: completedProjects.length,
        totalCount: activeProjects.length + completedProjects.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
