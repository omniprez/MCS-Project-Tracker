import { 
  users, 
  type User, 
  type InsertUser,
  projects,
  type Project,
  type InsertProject,
  teamMembers,
  type TeamMember,
  type InsertTeamMember,
  projectDocuments,
  type ProjectDocument,
  type InsertProjectDocument,
  projectStageHistory,
  type ProjectStageHistory,
  type InsertProjectStageHistory,
  tasks,
  type Task,
  type InsertTask,
  teamMemberBadges,
  type TeamMemberBadge,
  type InsertTeamMemberBadge,
  performanceMetrics,
  type PerformanceMetric,
  type InsertPerformanceMetric,
  monthlyTeamPerformance,
  type MonthlyTeamPerformance,
  type InsertMonthlyTeamPerformance,
  ProjectStage,
  ServiceType
} from "@shared/schema";
import { db } from "./db";
import { eq, or, sql, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProjectsByStatus(isCompleted: boolean): Promise<Project[]>;
  getProjectsByServiceType(serviceType: ServiceType): Promise<Project[]>;
  getProjectsByStage(stage: ProjectStage): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  updateProjectStage(id: number, stage: ProjectStage): Promise<Project | undefined>;
  
  // Team member methods
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMemberById(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  
  // Document methods
  getDocumentsByProjectId(projectId: number): Promise<ProjectDocument[]>;
  createDocument(document: InsertProjectDocument): Promise<ProjectDocument>;
  
  // Stage history methods
  getStageHistoryByProjectId(projectId: number): Promise<ProjectStageHistory[]>;
  createStageHistory(stageHistory: InsertProjectStageHistory): Promise<ProjectStageHistory>;
  
  // Task methods
  getTasksByProjectId(projectId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  
  // Badge methods
  getTeamMemberBadges(teamMemberId: number): Promise<TeamMemberBadge[]>;
  awardBadge(badge: InsertTeamMemberBadge): Promise<TeamMemberBadge>;
  
  // Performance metrics methods
  getTeamMemberPerformance(teamMemberId: number): Promise<PerformanceMetric | undefined>;
  updateTeamMemberPerformance(teamMemberId: number, metrics: Partial<PerformanceMetric>): Promise<PerformanceMetric>;
  
  // Team performance methods
  getMonthlyTeamPerformance(month: number, year: number): Promise<MonthlyTeamPerformance | undefined>;
  updateMonthlyTeamPerformance(month: number, year: number, data: Partial<MonthlyTeamPerformance>): Promise<MonthlyTeamPerformance>;
  getAllMonthlyTeamPerformance(year: number): Promise<MonthlyTeamPerformance[]>;
  
  // Dashboard stats
  getProjectCountByStage(): Promise<Record<ProjectStage, number>>;
  searchProjects(query: string): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private teamMembers: Map<number, TeamMember>;
  private documents: Map<number, ProjectDocument>;
  private stageHistory: Map<number, ProjectStageHistory>;
  private tasks: Map<number, Task>;
  private badges: Map<number, TeamMemberBadge>;
  private performanceMetrics: Map<number, PerformanceMetric>;
  private monthlyPerformance: Map<string, MonthlyTeamPerformance>;
  
  private userId: number;
  private projectId: number;
  private teamMemberId: number;
  private documentId: number;
  private stageHistoryId: number;
  private taskId: number;
  private badgeId: number;
  private metricId: number;
  private monthlyPerformanceId: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.teamMembers = new Map();
    this.documents = new Map();
    this.stageHistory = new Map();
    this.tasks = new Map();
    this.badges = new Map();
    this.performanceMetrics = new Map();
    this.monthlyPerformance = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.teamMemberId = 1;
    this.documentId = 1;
    this.stageHistoryId = 1;
    this.taskId = 1;
    this.badgeId = 1;
    this.metricId = 1;
    this.monthlyPerformanceId = 1;
    
    // Initialize with some team members
    this.initializeTeamMembers();
    
    // Initialize with sample projects
    this.initializeSampleProjects();
  }
  
  private initializeTeamMembers() {
    const defaultTeamMembers: InsertTeamMember[] = [
      { name: "Sarah Johnson", role: "Project Manager", email: "sarah@isp.com", phone: "555-123-4567" },
      { name: "Michael Chen", role: "Network Engineer", email: "michael@isp.com", phone: "555-234-5678" },
      { name: "Alex Rodriguez", role: "Field Technician", email: "alex@isp.com", phone: "555-345-6789" },
      { name: "Emily Wilson", role: "Sales Representative", email: "emily@isp.com", phone: "555-456-7890" },
      { name: "David Kim", role: "NOC Engineer", email: "david@isp.com", phone: "555-567-8901" }
    ];
    
    defaultTeamMembers.forEach(member => {
      this.createTeamMember(member);
    });
  }
  
  private initializeSampleProjects() {
    const sampleProjects: InsertProject[] = [
      {
        projectId: "P-2025-0001",
        customerName: "TechCorp Solutions",
        contactPerson: "John Anderson",
        email: "john@techcorp.com",
        phone: "555-789-1234",
        address: "123 Innovation Way, Technology Park, CA 94025",
        serviceType: ServiceType.Fiber,
        bandwidth: 1000,
        requirements: "Fiber connection for new office building with 250 employees. Redundant connection required. 24/7 support with 99.99% SLA.",
        assignedTo: 1,
        expectedCompletion: "2025-05-15",
        currentStage: ProjectStage.Requirements,
        isCompleted: false
      },
      {
        projectId: "P-2025-0002",
        customerName: "Global Financial Group",
        contactPerson: "Lisa Wong",
        email: "lwong@gfg.com",
        phone: "555-456-7890",
        address: "888 Money Avenue, Financial District, NY 10004",
        serviceType: ServiceType.Fiber,
        bandwidth: 10000,
        requirements: "Ultra-low latency connection between main office and data center. Dedicated fiber path with automatic failover.",
        assignedTo: 2,
        expectedCompletion: "2025-06-20",
        currentStage: ProjectStage.Survey,
        isCompleted: false
      },
      {
        projectId: "P-2025-0003",
        customerName: "Mountain View Medical Center",
        contactPerson: "Dr. Sarah Patel",
        email: "spatel@mvmc.org",
        phone: "555-222-3333",
        address: "456 Healing Boulevard, Mountain View, CA 94040",
        serviceType: ServiceType.Fiber,
        bandwidth: 500,
        requirements: "HIPAA-compliant network connection for new wing of hospital. Secure VPN access for remote staff.",
        assignedTo: 1,
        expectedCompletion: "2025-04-30",
        currentStage: ProjectStage.Confirmation,
        isCompleted: false
      },
      {
        projectId: "P-2025-0004",
        customerName: "Hilltop Vineyards",
        contactPerson: "Robert James",
        email: "robert@hilltopvineyards.com",
        phone: "555-987-6543",
        address: "1200 Vineyard Road, Napa Valley, CA 94558",
        serviceType: ServiceType.Wireless,
        bandwidth: 200,
        requirements: "Point-to-point wireless connection between main building and processing facility (2.5km apart). Weather-resistant equipment needed.",
        assignedTo: 3,
        expectedCompletion: "2025-03-15",
        currentStage: ProjectStage.Installation,
        isCompleted: false
      },
      {
        projectId: "P-2025-0005",
        customerName: "City College of San Francisco",
        contactPerson: "Maria Rodriguez",
        email: "mrodriguez@ccsf.edu",
        phone: "555-111-2222",
        address: "50 Education Drive, San Francisco, CA 94112",
        serviceType: ServiceType.Fiber,
        bandwidth: 2000,
        requirements: "Campus-wide fiber deployment connecting 5 buildings. Separate VLANs for staff, students, and administration.",
        assignedTo: 2,
        expectedCompletion: "2025-02-28",
        currentStage: ProjectStage.Handover,
        isCompleted: true
      },
      {
        projectId: "P-2025-0006",
        customerName: "Sunrise Apartments",
        contactPerson: "David Lee",
        email: "dlee@sunriseapts.com",
        phone: "555-333-4444",
        address: "789 Residential Lane, Sunshine City, FL 33101",
        serviceType: ServiceType.Fiber,
        bandwidth: 1500,
        requirements: "Fiber to the building with individual connections to 120 apartments. Managed WiFi in common areas.",
        assignedTo: 1,
        expectedCompletion: "2025-07-10",
        currentStage: ProjectStage.Survey,
        isCompleted: false
      },
      {
        projectId: "P-2025-0007",
        customerName: "Remote Mountain Resort",
        contactPerson: "Jennifer Smith",
        email: "jsmith@mountainresort.com",
        phone: "555-444-5555",
        address: "1 Resort Way, Rocky Mountains, CO 80517",
        serviceType: ServiceType.Wireless,
        bandwidth: 300,
        requirements: "Wireless connectivity across 500-acre property. Mesh network with multiple access points. Must withstand extreme weather conditions.",
        assignedTo: 3,
        expectedCompletion: "2025-08-30",
        currentStage: ProjectStage.Requirements,
        isCompleted: false
      }
    ];
    
    // Create projects
    sampleProjects.forEach(project => {
      // Generate unique ID
      const id = this.projectId++;
      
      // Set creation and update dates
      // Create projects with staggered dates to simulate real-world progression
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - (Math.random() * 30)); // Random date in the last 30 days
      
      const projectData: Project = {
        ...project,
        id,
        createdAt: new Date(baseDate),
        updatedAt: new Date(baseDate)
      };
      
      // Store the project
      this.projects.set(id, projectData);
      
      // Create initial stage history
      this.createStageHistory({
        projectId: id,
        stage: ProjectStage.Requirements,
        notes: "Project initialized with requirements",
        changedBy: project.assignedTo
      });
      
      // Add sample documents to each project
      this.createDocument({
        projectId: id,
        name: "Requirements Document",
        type: "pdf",
        url: "https://example.com/documents/requirements.pdf"
      });
      
      // Add additional history if project has progressed beyond initial stage
      if (project.currentStage >= ProjectStage.Survey) {
        const surveyDate = new Date(baseDate);
        surveyDate.setDate(surveyDate.getDate() + 3); // 3 days after creation
        
        this.createStageHistory({
          projectId: id,
          stage: ProjectStage.Survey,
          notes: "Site survey completed. Location verified for installation.",
          changedBy: project.assignedTo,
          timestamp: surveyDate
        } as any); // Using any to bypass TypeScript error about timestamp
        
        // Add survey document
        this.createDocument({
          projectId: id,
          name: "Site Survey Report",
          type: "pdf",
          url: "https://example.com/documents/survey_report.pdf"
        });
      }
      
      if (project.currentStage >= ProjectStage.Confirmation) {
        const confirmDate = new Date(baseDate);
        confirmDate.setDate(confirmDate.getDate() + 7); // 7 days after creation
        
        this.createStageHistory({
          projectId: id,
          stage: ProjectStage.Confirmation,
          notes: "Customer confirmed project scope and costs.",
          changedBy: project.assignedTo,
          timestamp: confirmDate
        } as any);
        
        // Add confirmation documents
        this.createDocument({
          projectId: id,
          name: "Service Agreement",
          type: "pdf",
          url: "https://example.com/documents/service_agreement.pdf"
        });
        
        this.createDocument({
          projectId: id,
          name: "Financial Approval",
          type: "pdf",
          url: "https://example.com/documents/financial_approval.pdf"
        });
      }
      
      if (project.currentStage >= ProjectStage.Installation) {
        const installDate = new Date(baseDate);
        installDate.setDate(installDate.getDate() + 14); // 14 days after creation
        
        this.createStageHistory({
          projectId: id,
          stage: ProjectStage.Installation,
          notes: "Equipment installed and initial testing completed.",
          changedBy: project.assignedTo,
          timestamp: installDate
        } as any);
        
        // Add installation documents
        this.createDocument({
          projectId: id,
          name: "Installation Photos",
          type: "zip",
          url: "https://example.com/documents/installation_photos.zip"
        });
        
        this.createDocument({
          projectId: id,
          name: "Network Topology",
          type: "pdf",
          url: "https://example.com/documents/network_topology.pdf"
        });
      }
      
      if (project.currentStage === ProjectStage.Handover) {
        const handoverDate = new Date(baseDate);
        handoverDate.setDate(handoverDate.getDate() + 21); // 21 days after creation
        
        this.createStageHistory({
          projectId: id,
          stage: ProjectStage.Handover,
          notes: "Service activated and handed over to NOC for monitoring.",
          changedBy: project.assignedTo,
          timestamp: handoverDate
        } as any);
        
        // Add handover documents
        this.createDocument({
          projectId: id,
          name: "Service Handover Certificate",
          type: "pdf",
          url: "https://example.com/documents/handover_certificate.pdf"
        });
        
        this.createDocument({
          projectId: id,
          name: "Network Performance Test Results",
          type: "pdf",
          url: "https://example.com/documents/performance_test.pdf"
        });
        
        this.createDocument({
          projectId: id,
          name: "Customer Training Materials",
          type: "pdf",
          url: "https://example.com/documents/training_materials.pdf"
        });
        
        // Add some tasks for completed projects
        this.createTask({
          projectId: id,
          title: "Schedule final verification",
          description: "Conduct final verification of all equipment and connections",
          assignedTo: 5, // Assigned to NOC Engineer
          stage: ProjectStage.Handover,
          isCompleted: true,
          dueDate: handoverDate
        });
      }
      
      // Add some sample tasks to each project
      if (project.currentStage === ProjectStage.Requirements) {
        this.createTask({
          projectId: id,
          title: "Collect network diagrams",
          description: "Get network diagrams and requirements from the customer",
          assignedTo: project.assignedTo,
          stage: ProjectStage.Requirements,
          isCompleted: false,
          dueDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000) // Due in 7 days
        });
      }
      
      if (project.currentStage === ProjectStage.Survey) {
        this.createTask({
          projectId: id,
          title: "Site survey",
          description: "Complete site survey and document findings",
          assignedTo: 3, // Field Technician
          stage: ProjectStage.Survey,
          isCompleted: false,
          dueDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000) // Due in 5 days
        });
      }
      
      if (project.currentStage === ProjectStage.Installation) {
        this.createTask({
          projectId: id,
          title: "Equipment installation",
          description: "Install all networking equipment according to plan",
          assignedTo: 3, // Field Technician
          stage: ProjectStage.Installation,
          isCompleted: false,
          dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000) // Due in 3 days
        });
        
        this.createTask({
          projectId: id,
          title: "Network configuration",
          description: "Configure all network devices and test connectivity",
          assignedTo: 2, // Network Engineer
          stage: ProjectStage.Installation,
          isCompleted: false,
          dueDate: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000) // Due in 4 days
        });
      }
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByStatus(isCompleted: boolean): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.isCompleted === isCompleted
    );
  }
  
  async getProjectsByServiceType(serviceType: ServiceType): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.serviceType === serviceType
    );
  }
  
  async getProjectsByStage(stage: ProjectStage): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.currentStage === stage
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const now = new Date();
    // Generate a unique project ID (format: P-YYYY-XXXX)
    const projectIdStr = `P-${now.getFullYear()}-${String(id).padStart(4, '0')}`;
    
    const project: Project = {
      ...insertProject,
      id,
      projectId: projectIdStr,
      createdAt: now,
      updatedAt: now
    };
    
    this.projects.set(id, project);
    
    // Create initial stage history entry
    this.createStageHistory({
      projectId: id,
      stage: ProjectStage.Requirements,
      notes: "Project created",
      changedBy: insertProject.assignedTo
    });
    
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = {
      ...project,
      ...projectUpdate,
      updatedAt: new Date()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async updateProjectStage(id: number, stage: ProjectStage): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const prevStage = project.currentStage;
    
    // Only allow moving one stage at a time, unless explicitly going to Handover
    if (stage !== ProjectStage.Handover && Math.abs(stage - prevStage) > 1) {
      return undefined;
    }
    
    // If moving to handover, mark as completed
    const isCompleted = stage === ProjectStage.Handover;
    
    const updatedProject: Project = {
      ...project,
      currentStage: stage,
      isCompleted,
      updatedAt: new Date()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  // Team member methods
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }
  
  async getTeamMemberById(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }
  
  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberId++;
    const teamMember: TeamMember = { ...insertTeamMember, id };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }
  
  // Document methods
  async getDocumentsByProjectId(projectId: number): Promise<ProjectDocument[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.projectId === projectId
    );
  }
  
  async createDocument(insertDocument: InsertProjectDocument): Promise<ProjectDocument> {
    const id = this.documentId++;
    const document: ProjectDocument = {
      ...insertDocument,
      id,
      uploadedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }
  
  // Stage history methods
  async getStageHistoryByProjectId(projectId: number): Promise<ProjectStageHistory[]> {
    return Array.from(this.stageHistory.values())
      .filter(history => history.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createStageHistory(insertStageHistory: InsertProjectStageHistory): Promise<ProjectStageHistory> {
    const id = this.stageHistoryId++;
    const stageHistory: ProjectStageHistory = {
      ...insertStageHistory,
      id,
      timestamp: new Date()
    };
    this.stageHistory.set(id, stageHistory);
    return stageHistory;
  }
  
  // Task methods
  async getTasksByProjectId(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.projectId === projectId
    );
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = {
      ...task,
      ...taskUpdate
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  // Badge methods
  async getTeamMemberBadges(teamMemberId: number): Promise<TeamMemberBadge[]> {
    return Array.from(this.badges.values()).filter(
      badge => badge.teamMemberId === teamMemberId
    );
  }
  
  async awardBadge(badge: InsertTeamMemberBadge): Promise<TeamMemberBadge> {
    const id = this.badgeId++;
    const newBadge: TeamMemberBadge = {
      ...badge,
      id,
      awardedAt: new Date()
    };
    this.badges.set(id, newBadge);
    return newBadge;
  }
  
  // Performance metrics methods
  async getTeamMemberPerformance(teamMemberId: number): Promise<PerformanceMetric | undefined> {
    return Array.from(this.performanceMetrics.values()).find(
      metric => metric.teamMemberId === teamMemberId
    );
  }
  
  async updateTeamMemberPerformance(teamMemberId: number, metrics: Partial<PerformanceMetric>): Promise<PerformanceMetric> {
    const existingMetric = await this.getTeamMemberPerformance(teamMemberId);
    
    if (existingMetric) {
      // Update existing record
      const updatedMetric: PerformanceMetric = {
        ...existingMetric,
        ...metrics,
        updatedAt: new Date()
      };
      this.performanceMetrics.set(existingMetric.id, updatedMetric);
      return updatedMetric;
    } else {
      // Create new record
      const id = this.metricId++;
      const newMetric: PerformanceMetric = {
        id,
        teamMemberId,
        projectsCompleted: metrics.projectsCompleted || 0,
        avgCompletionTime: metrics.avgCompletionTime || 0,
        customerSatisfactionScore: metrics.customerSatisfactionScore || 0,
        updatedAt: new Date()
      };
      this.performanceMetrics.set(id, newMetric);
      return newMetric;
    }
  }
  
  // Team performance methods
  async getMonthlyTeamPerformance(month: number, year: number): Promise<MonthlyTeamPerformance | undefined> {
    const key = `${year}-${month}`;
    return this.monthlyPerformance.get(key);
  }
  
  async updateMonthlyTeamPerformance(month: number, year: number, data: Partial<MonthlyTeamPerformance>): Promise<MonthlyTeamPerformance> {
    const key = `${year}-${month}`;
    const existingPerformance = this.monthlyPerformance.get(key);
    
    if (existingPerformance) {
      // Update existing record
      const updatedPerformance: MonthlyTeamPerformance = {
        ...existingPerformance,
        ...data
      };
      this.monthlyPerformance.set(key, updatedPerformance);
      return updatedPerformance;
    } else {
      // Create new record
      const id = this.monthlyPerformanceId++;
      const newPerformance: MonthlyTeamPerformance = {
        id,
        month,
        year,
        avgProjectCompletionTime: data.avgProjectCompletionTime || 0,
        projectsCompleted: data.projectsCompleted || 0,
        customerSatisfactionAvg: data.customerSatisfactionAvg || 0
      };
      this.monthlyPerformance.set(key, newPerformance);
      return newPerformance;
    }
  }
  
  async getAllMonthlyTeamPerformance(year: number): Promise<MonthlyTeamPerformance[]> {
    return Array.from(this.monthlyPerformance.values())
      .filter(performance => performance.year === year)
      .sort((a, b) => a.month - b.month);
  }
  
  // Dashboard stats
  async getProjectCountByStage(): Promise<Record<ProjectStage, number>> {
    const counts: Record<ProjectStage, number> = {
      [ProjectStage.Requirements]: 0,
      [ProjectStage.Survey]: 0,
      [ProjectStage.Confirmation]: 0,
      [ProjectStage.Installation]: 0,
      [ProjectStage.Handover]: 0
    };
    
    Array.from(this.projects.values()).forEach(project => {
      counts[project.currentStage] += 1;
    });
    
    return counts;
  }
  
  async searchProjects(query: string): Promise<Project[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.projects.values()).filter(project => 
      project.customerName.toLowerCase().includes(lowercaseQuery) ||
      project.projectId.toLowerCase().includes(lowercaseQuery) ||
      project.contactPerson.toLowerCase().includes(lowercaseQuery) ||
      project.email.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// DatabaseStorage implementation for persistent data storage
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure null values for optional fields
    const userData = {
      ...insertUser,
      name: insertUser.name || null,
      role: insertUser.role || null,
      email: insertUser.email || null
    };
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }
  
  async getProjectsByStatus(isCompleted: boolean): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.isCompleted, isCompleted));
  }
  
  async getProjectsByServiceType(serviceType: ServiceType): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.serviceType, serviceType));
  }
  
  async getProjectsByStage(stage: ProjectStage): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.currentStage, stage));
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const now = new Date();
    
    // Generate a unique project ID (format: P-YYYY-XXXX)
    // First, get the current count of projects to use for the ID suffix
    const projectCount = await db.select({ count: sql`count(*)` }).from(projects);
    const count = Number(projectCount[0].count) + 1;
    const projectIdStr = `P-${now.getFullYear()}-${String(count).padStart(4, '0')}`;
    
    console.log(`Generated project ID: ${projectIdStr}`);
    
    // Add the generated projectId to the project data
    const projectData = {
      ...insertProject,
      projectId: projectIdStr
    };
    
    // Insert the project with the generated ID
    const [project] = await db.insert(projects).values(projectData).returning();
    
    // Create initial stage history entry
    await this.createStageHistory({
      projectId: project.id,
      stage: ProjectStage.Requirements,
      notes: "Project created",
      changedBy: project.assignedTo
    });
    
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }
  
  async updateProjectStage(id: number, stage: ProjectStage): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ currentStage: stage })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }
  
  // Team member methods
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }
  
  async getTeamMemberById(id: number): Promise<TeamMember | undefined> {
    const [teamMember] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return teamMember || undefined;
  }
  
  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const [teamMember] = await db.insert(teamMembers).values(insertTeamMember).returning();
    return teamMember;
  }
  
  // Document methods
  async getDocumentsByProjectId(projectId: number): Promise<ProjectDocument[]> {
    return await db.select().from(projectDocuments).where(eq(projectDocuments.projectId, projectId));
  }
  
  async createDocument(insertDocument: InsertProjectDocument): Promise<ProjectDocument> {
    const [document] = await db.insert(projectDocuments).values(insertDocument).returning();
    return document;
  }
  
  // Stage history methods
  async getStageHistoryByProjectId(projectId: number): Promise<ProjectStageHistory[]> {
    return await db
      .select()
      .from(projectStageHistory)
      .where(eq(projectStageHistory.projectId, projectId))
      .orderBy(projectStageHistory.timestamp);
  }
  
  async createStageHistory(insertStageHistory: InsertProjectStageHistory): Promise<ProjectStageHistory> {
    const [stageHistory] = await db
      .insert(projectStageHistory)
      .values(insertStageHistory)
      .returning();
    return stageHistory;
  }
  
  // Task methods
  async getTasksByProjectId(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }
  
  // Dashboard stats
  async getProjectCountByStage(): Promise<Record<ProjectStage, number>> {
    const result: Record<ProjectStage, number> = {
      [ProjectStage.Requirements]: 0,
      [ProjectStage.Survey]: 0,
      [ProjectStage.Confirmation]: 0,
      [ProjectStage.Installation]: 0,
      [ProjectStage.Handover]: 0,
    };
    
    const counts = await db
      .select({
        stage: projects.currentStage,
        count: sql`count(*)::int`,
      })
      .from(projects)
      .groupBy(projects.currentStage);
    
    counts.forEach((item) => {
      result[item.stage] = item.count;
    });
    
    return result;
  }
  
  async searchProjects(query: string): Promise<Project[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    
    return await db
      .select()
      .from(projects)
      .where(
        or(
          sql`lower(${projects.customerName}) like ${lowercaseQuery}`,
          sql`lower(${projects.contactPerson}) like ${lowercaseQuery}`,
          sql`lower(${projects.projectId}) like ${lowercaseQuery}`,
          sql`lower(${projects.address}) like ${lowercaseQuery}`
        )
      );
  }
  
  // Badge methods
  async getTeamMemberBadges(teamMemberId: number): Promise<TeamMemberBadge[]> {
    return await db
      .select()
      .from(teamMemberBadges)
      .where(eq(teamMemberBadges.teamMemberId, teamMemberId));
  }
  
  async awardBadge(badge: InsertTeamMemberBadge): Promise<TeamMemberBadge> {
    const [newBadge] = await db
      .insert(teamMemberBadges)
      .values({
        ...badge,
        awardedAt: new Date()
      })
      .returning();
    return newBadge;
  }
  
  // Performance metrics methods
  async getTeamMemberPerformance(teamMemberId: number): Promise<PerformanceMetric | undefined> {
    const [metric] = await db
      .select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.teamMemberId, teamMemberId));
    return metric || undefined;
  }
  
  async updateTeamMemberPerformance(teamMemberId: number, metrics: Partial<PerformanceMetric>): Promise<PerformanceMetric> {
    // Check if a record exists
    const existingMetric = await this.getTeamMemberPerformance(teamMemberId);
    
    if (existingMetric) {
      // Update existing record
      const [updatedMetric] = await db
        .update(performanceMetrics)
        .set({
          ...metrics,
          updatedAt: new Date()
        })
        .where(eq(performanceMetrics.id, existingMetric.id))
        .returning();
      return updatedMetric;
    } else {
      // Create new record
      const [newMetric] = await db
        .insert(performanceMetrics)
        .values({
          teamMemberId,
          projectsCompleted: metrics.projectsCompleted || 0,
          avgCompletionTime: metrics.avgCompletionTime || 0,
          customerSatisfactionScore: metrics.customerSatisfactionScore || 0,
          updatedAt: new Date()
        })
        .returning();
      return newMetric;
    }
  }
  
  // Team performance methods
  async getMonthlyTeamPerformance(month: number, year: number): Promise<MonthlyTeamPerformance | undefined> {
    const [performance] = await db
      .select()
      .from(monthlyTeamPerformance)
      .where(
        and(
          eq(monthlyTeamPerformance.month, month),
          eq(monthlyTeamPerformance.year, year)
        )
      );
    return performance || undefined;
  }
  
  async updateMonthlyTeamPerformance(month: number, year: number, data: Partial<MonthlyTeamPerformance>): Promise<MonthlyTeamPerformance> {
    // Check if a record exists
    const existingPerformance = await this.getMonthlyTeamPerformance(month, year);
    
    if (existingPerformance) {
      // Update existing record
      const [updatedPerformance] = await db
        .update(monthlyTeamPerformance)
        .set(data)
        .where(eq(monthlyTeamPerformance.id, existingPerformance.id))
        .returning();
      return updatedPerformance;
    } else {
      // Create new record
      const [newPerformance] = await db
        .insert(monthlyTeamPerformance)
        .values({
          month,
          year,
          avgProjectCompletionTime: data.avgProjectCompletionTime || 0,
          projectsCompleted: data.projectsCompleted || 0,
          customerSatisfactionAvg: data.customerSatisfactionAvg || 0
        })
        .returning();
      return newPerformance;
    }
  }
  
  async getAllMonthlyTeamPerformance(year: number): Promise<MonthlyTeamPerformance[]> {
    return await db
      .select()
      .from(monthlyTeamPerformance)
      .where(eq(monthlyTeamPerformance.year, year))
      .orderBy(monthlyTeamPerformance.month);
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();
