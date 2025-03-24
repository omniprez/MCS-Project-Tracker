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
  ProjectStage,
  ServiceType
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  
  private userId: number;
  private projectId: number;
  private teamMemberId: number;
  private documentId: number;
  private stageHistoryId: number;
  private taskId: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.teamMembers = new Map();
    this.documents = new Map();
    this.stageHistory = new Map();
    this.tasks = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.teamMemberId = 1;
    this.documentId = 1;
    this.stageHistoryId = 1;
    this.taskId = 1;
    
    // Initialize with some team members
    this.initializeTeamMembers();
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

export const storage = new MemStorage();
