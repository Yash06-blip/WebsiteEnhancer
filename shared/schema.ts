import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export enum UserRole {
  MANAGER = 1,
  MINER = 2,
  OPERATOR = 3,
  DRILLER = 4,
  BLASTER = 5,
}

// Shift types enum
export enum ShiftType {
  MORNING = "morning",
  EVENING = "evening",
  NIGHT = "night",
}

// Log types enum
export enum LogType {
  STATUTORY = "statutory",
  NON_STATUTORY = "non-statutory",
}

// Log status enum
export enum LogStatus {
  PENDING_REVIEW = "pending_review",
  REQUIRES_ATTENTION = "requires_attention",
  COMPLETED = "completed",
}

// Incident priority enum
export enum IncidentPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Incident status enum
export enum IncidentStatus {
  ACTIVE = "active",
  RESOLVED = "resolved",
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: integer("role").notNull(),
  initials: text("initials").notNull(),
  email: text("email"),
  contact: text("contact"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  initials: true,
  email: true,
  contact: true,
});

// Handover logs table
export const handoverLogs = pgTable("handover_logs", {
  id: serial("id").primaryKey(),
  logNumber: text("log_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  shift: text("shift").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  content: text("content").notNull(),
  comments: text("comments"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHandoverLogSchema = createInsertSchema(handoverLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Incidents table
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  reportedBy: integer("reported_by").notNull(),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  assignedTo: integer("assigned_to").notNull(),
  createdBy: integer("created_by").notNull(),
  status: text("status").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Shifts table
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  shiftType: text("shift_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  users: text("users").array().notNull(),
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
});

// Templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdBy: integer("created_by").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI analysis table
export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  logId: integer("log_id").notNull(),
  category: text("category").notNull(),
  importance: text("importance").notNull(),
  suggestions: json("suggestions").notNull(),
  keywords: json("keywords").notNull(),
  followUpActions: json("follow_up_actions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type HandoverLog = typeof handoverLogs.$inferSelect;
export type InsertHandoverLog = typeof handoverLogs.$inferInsert;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertAiAnalysis = typeof aiAnalysis.$inferInsert;
