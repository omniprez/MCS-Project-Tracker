import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertTaskSchema, 
  insertProjectStageHistorySchema,
  insertTeamMemberSchema,
  insertProjectDocumentSchema,
  insertUserSchema,
  loginUserSchema,
  ProjectStage,
  ServiceType,
  InsertTeamMemberBadge,
  PerformanceMetric,
  MonthlyTeamPerformance
} from "@shared/schema";
import passport from "passport";
import { isAuthenticated, hashPassword, isUsernameAvailable } from "./auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendNewProjectNotification, sendProjectUpdateNotification, checkEmailConfiguration } from "./services/emailService";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage_config });

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username is available
      const isAvailable = await isUsernameAvailable(userData.username);
      if (!isAvailable) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  // Login
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate login data
      const loginData = loginUserSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          
          return res.json({
            message: "Login successful",
            user: userWithoutPassword
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  // Get current user
  app.get("/api/auth/me", isAuthenticated, (req: Request, res: Response) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
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
      console.log("Received project creation request with data:", req.body);
      
      // Parse project data without requiring projectId
      const { projectId, ...otherData } = req.body;
      const projectData = otherData;
      
      console.log("Parsed project data:", projectData);
      const project = await storage.createProject(projectData);
      console.log("Created project:", project);
      
      // Send email notification for the new project
      try {
        // Check if email configuration is valid before attempting to send
        if (checkEmailConfiguration()) {
          await sendNewProjectNotification(project);
          console.log("New project notification email sent");
        } else {
          console.log("Email configuration not set up, skipping notification");
        }
      } catch (emailError) {
        // Don't fail the request if email sending fails
        console.error("Error sending email notification:", emailError);
      }
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: error.errors 
        });
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
      
      // Send email notification for the project update
      try {
        if (checkEmailConfiguration() && updatedProject) {
          await sendProjectUpdateNotification(updatedProject, 'details');
          console.log("Project update notification email sent");
        } else {
          console.log("Email configuration not set up or project is undefined, skipping notification");
        }
      } catch (emailError) {
        // Don't fail the request if email sending fails
        console.error("Error sending email notification:", emailError);
      }
      
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
      
      // Send email notification for the stage advancement
      try {
        if (checkEmailConfiguration() && updatedProject) {
          await sendProjectUpdateNotification(updatedProject, 'stage');
          console.log("Project stage update notification email sent");
        } else {
          console.log("Email configuration not set up or project is undefined, skipping notification");
        }
      } catch (emailError) {
        // Don't fail the request if email sending fails
        console.error("Error sending email notification:", emailError);
      }
      
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
  
  // Upload document for project
  app.post("/api/projects/:id/documents", upload.single('file'), async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { originalname, mimetype, filename, path: filePath, size } = req.file;
      
      // Create a URL for the file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/${filename}`;
      
      const documentData = {
        projectId,
        name: originalname,
        type: mimetype,
        url: fileUrl
      };
      
      const document = await storage.createDocument(documentData);
      
      // Send email notification for the document upload
      try {
        if (checkEmailConfiguration()) {
          await sendProjectUpdateNotification(project, 'document');
          console.log("Document upload notification email sent");
        } else {
          console.log("Email configuration not set up, skipping notification");
        }
      } catch (emailError) {
        // Don't fail the request if email sending fails
        console.error("Error sending email notification:", emailError);
      }
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Error uploading document" });
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
  // GET team member badges
  app.get("/api/team-members/:id/badges", async (req: Request, res: Response) => {
    try {
      const teamMemberId = parseInt(req.params.id);
      const badges = await storage.getTeamMemberBadges(teamMemberId);
      res.json(badges);
    } catch (error) {
      console.error("Error getting team member badges:", error);
      res.status(500).json({ message: "Failed to retrieve badges" });
    }
  });

  // POST award a badge to a team member
  app.post("/api/team-members/:id/badges", async (req: Request, res: Response) => {
    try {
      const teamMemberId = parseInt(req.params.id);
      const badgeData: InsertTeamMemberBadge = {
        teamMemberId,
        badgeType: req.body.badgeType,
        reason: req.body.reason
      };

      const newBadge = await storage.awardBadge(badgeData);
      res.status(201).json(newBadge);
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ message: "Failed to award badge" });
    }
  });

  // GET team member performance
  app.get("/api/team-members/:id/performance", async (req: Request, res: Response) => {
    try {
      const teamMemberId = parseInt(req.params.id);
      const performance = await storage.getTeamMemberPerformance(teamMemberId);

      if (!performance) {
        return res.status(404).json({ message: "Performance metrics not found" });
      }

      res.json(performance);
    } catch (error) {
      console.error("Error getting team member performance:", error);
      res.status(500).json({ message: "Failed to retrieve performance metrics" });
    }
  });

  // PUT/update team member performance
  app.put("/api/team-members/:id/performance", async (req: Request, res: Response) => {
    try {
      const teamMemberId = parseInt(req.params.id);
      const metrics: Partial<PerformanceMetric> = {
        projectsCompleted: req.body.projectsCompleted,
        avgCompletionTime: req.body.avgCompletionTime,
        customerSatisfactionScore: req.body.customerSatisfactionScore
      };

      const updatedMetrics = await storage.updateTeamMemberPerformance(teamMemberId, metrics);
      res.json(updatedMetrics);
    } catch (error) {
      console.error("Error updating team member performance:", error);
      res.status(500).json({ message: "Failed to update performance metrics" });
    }
  });

  // GET monthly team performance
  app.get("/api/performance/monthly/:year/:month", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      const performance = await storage.getMonthlyTeamPerformance(month, year);

      if (!performance) {
        return res.status(404).json({ message: "Monthly performance not found" });
      }

      res.json(performance);
    } catch (error) {
      console.error("Error getting monthly team performance:", error);
      res.status(500).json({ message: "Failed to retrieve monthly performance" });
    }
  });

  // GET all monthly team performance for a year
  app.get("/api/performance/monthly/:year", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const performances = await storage.getAllMonthlyTeamPerformance(year);
      res.json(performances);
    } catch (error) {
      console.error("Error getting yearly team performance:", error);
      res.status(500).json({ message: "Failed to retrieve yearly performance data" });
    }
  });

  // PUT/update monthly team performance
  app.put("/api/performance/monthly/:year/:month", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      const performanceData: Partial<MonthlyTeamPerformance> = {
        avgProjectCompletionTime: req.body.avgProjectCompletionTime,
        projectsCompleted: req.body.projectsCompleted, 
        customerSatisfactionAvg: req.body.customerSatisfactionAvg
      };

      const updatedPerformance = await storage.updateMonthlyTeamPerformance(month, year, performanceData);
      res.json(updatedPerformance);
    } catch (error) {
      console.error("Error updating monthly team performance:", error);
      res.status(500).json({ message: "Failed to update monthly performance" });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}

