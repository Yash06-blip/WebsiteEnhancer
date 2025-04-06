import { db } from './db';
import { mysqlTable, int, varchar, text, timestamp, json, boolean } from 'drizzle-orm/mysql-core';

// User roles enum
export enum UserRole {
  MANAGER = 1,
  MINER = 2,
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
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  role_id: int('role_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  contact_no: varchar('contact_no', { length: 255 }),
  address: text('address'),
  blood_group: varchar('blood_group', { length: 10 }),
  work_experience: int('work_experience'),
  initials: varchar('initials', { length: 10 }),
});

// Handover logs table
export const handoverLogs = mysqlTable('handover_logs', {
  id: int('id').primaryKey().autoincrement(),
  log_number: varchar('log_number', { length: 50 }).notNull().unique(),
  user_id: int('user_id').notNull(),
  shift: varchar('shift', { length: 50 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  content: text('content').notNull(),
  comments: text('comments'),
  reviewed_by: int('reviewed_by'),
  reviewed_at: timestamp('reviewed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Incidents table
export const incidents = mysqlTable('incidents', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  priority: varchar('priority', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  reported_by: int('reported_by').notNull(),
  resolved_by: int('resolved_by'),
  resolved_at: timestamp('resolved_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks table
export const tasks = mysqlTable('tasks', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  assigned_to: int('assigned_to').notNull(),
  created_by: int('created_by').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Shifts table
export const shifts = mysqlTable('shifts', {
  id: int('id').primaryKey().autoincrement(),
  shift_type: varchar('shift_type', { length: 50 }).notNull(),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  users: json('users').notNull(),
});

// Templates table
export const templates = mysqlTable('templates', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  created_by: int('created_by').notNull(),
  is_ai_generated: boolean('is_ai_generated').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// AI analysis table
export const aiAnalysis = mysqlTable('ai_analysis', {
  id: int('id').primaryKey().autoincrement(),
  log_id: int('log_id').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  importance: varchar('importance', { length: 50 }).notNull(),
  suggestions: json('suggestions').notNull(),
  keywords: json('keywords').notNull(),
  follow_up_actions: json('follow_up_actions'),
  created_at: timestamp('created_at').defaultNow().notNull(),
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
