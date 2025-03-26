import { pgTable, text, serial, integer, boolean, timestamp, json, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  email: true,
});

// User login schema
export const loginUserSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

// Project stages
export enum ProjectStage {
  Requirements = 1,
  Survey = 2,
  Confirmation = 3,
  Installation = 4,
  Handover = 5,
}

// Service types
export enum ServiceType {
  Fiber = "fiber",
  Wireless = "wireless",
}

// Team member role
export enum TeamMemberRole {
  ProjectManager = "Project Manager",
  NetworkEngineer = "Network Engineer",
  FieldTechnician = "Field Technician",
  SalesRepresentative = "Sales Representative",
  NOCEngineer = "NOC Engineer",
}

// Badge types
export enum BadgeType {
  SpeedDemon = "speed_demon",         // For completing projects ahead of schedule
  TechWizard = "tech_wizard",         // For resolving complex technical issues
  CustomerWhisperer = "customer_whisperer", // For excellent customer satisfaction
  TeamPlayer = "team_player",         // For helping team members
  FirstMile = "first_mile",           // First project completion milestone
  FifthMile = "fifth_mile",           // Five projects completed milestone
  TenthMile = "tenth_mile",           // Ten projects completed milestone
  PerfectScore = "perfect_score",     // For completing a project with no issues
  OnTime = "on_time",                 // For completing projects on time
  EfficiencyExpert = "efficiency_expert" // For completing projects with minimal resources
}

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  serviceType: text("service_type").notNull(),
  bandwidth: integer("bandwidth").notNull(),
  requirements: text("requirements"),
  assignedTo: integer("assigned_to").notNull(),
  expectedCompletion: text("expected_completion").notNull(),
  currentStage: integer("current_stage").notNull().default(1),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Team members schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
});

// Project documents schema
export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Project stage history schema
export const projectStageHistory = pgTable("project_stage_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  stage: integer("stage").notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  changedBy: integer("changed_by").notNull(),
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").notNull(),
  stage: integer("stage").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Team member badges schema
export const teamMemberBadges = pgTable("team_member_badges", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("team_member_id").notNull(),
  badgeType: text("badge_type").notNull(),
  awardedAt: timestamp("awarded_at").notNull().defaultNow(),
  projectId: integer("project_id"), // Optional: which project earned this badge
  description: text("description"), // Custom description or reasoning for the badge
});

// Performance metrics schema
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("team_member_id").notNull(),
  projectsCompleted: integer("projects_completed").notNull().default(0),
  avgCompletionTime: decimal("avg_completion_time", { precision: 10, scale: 2 }), // in days
  customerSatisfactionScore: decimal("customer_satisfaction_score", { precision: 3, scale: 2 }), // 1-10 rating
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Monthly team performance schema
export const monthlyTeamPerformance = pgTable("monthly_team_performance", {
  id: serial("id").primaryKey(), 
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  projectsCompleted: integer("projects_completed").notNull().default(0),
  avgProjectCompletionTime: decimal("avg_project_completion_time", { precision: 10, scale: 2 }).default("0"), // in days
  customerSatisfactionAvg: decimal("customer_satisfaction_avg", { precision: 3, scale: 2 }).default("0"), // 1-10 rating
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    serviceType: z.enum([ServiceType.Fiber, ServiceType.Wireless]),
    currentStage: z.number().min(1).max(5),
    projectId: z.string().optional(), // Make projectId optional so server can generate it
  });

export const insertTeamMemberSchema = createInsertSchema(teamMembers)
  .omit({ id: true });

export const insertProjectDocumentSchema = createInsertSchema(projectDocuments)
  .omit({ id: true, uploadedAt: true });

export const insertProjectStageHistorySchema = createInsertSchema(projectStageHistory)
  .omit({ id: true, timestamp: true });

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true });

export const insertTeamMemberBadgeSchema = createInsertSchema(teamMemberBadges)
  .omit({ id: true, awardedAt: true })
  .extend({
    badgeType: z.enum([
      BadgeType.SpeedDemon,
      BadgeType.TechWizard,
      BadgeType.CustomerWhisperer,
      BadgeType.TeamPlayer,
      BadgeType.FirstMile,
      BadgeType.FifthMile,
      BadgeType.TenthMile,
      BadgeType.PerfectScore,
      BadgeType.OnTime,
      BadgeType.EfficiencyExpert
    ])
  });

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics)
  .omit({ id: true, updatedAt: true });

export const insertMonthlyTeamPerformanceSchema = createInsertSchema(monthlyTeamPerformance)
  .omit({ id: true });

// Types
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;
export type ProjectDocument = typeof projectDocuments.$inferSelect;

export type InsertProjectStageHistory = z.infer<typeof insertProjectStageHistorySchema>;
export type ProjectStageHistory = typeof projectStageHistory.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTeamMemberBadge = z.infer<typeof insertTeamMemberBadgeSchema>;
export type TeamMemberBadge = typeof teamMemberBadges.$inferSelect;

export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;

export type InsertMonthlyTeamPerformance = z.infer<typeof insertMonthlyTeamPerformanceSchema>;
export type MonthlyTeamPerformance = typeof monthlyTeamPerformance.$inferSelect;
