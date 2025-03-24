import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
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

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    serviceType: z.enum([ServiceType.Fiber, ServiceType.Wireless]),
    currentStage: z.number().min(1).max(5),
  });

export const insertTeamMemberSchema = createInsertSchema(teamMembers)
  .omit({ id: true });

export const insertProjectDocumentSchema = createInsertSchema(projectDocuments)
  .omit({ id: true, uploadedAt: true });

export const insertProjectStageHistorySchema = createInsertSchema(projectStageHistory)
  .omit({ id: true, timestamp: true });

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true });

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
