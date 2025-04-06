import { 
  users, type User, type InsertUser,
  handoverLogs, type HandoverLog, type InsertHandoverLog,
  incidents, type Incident, type InsertIncident,
  tasks, type Task, type InsertTask,
  shifts, type Shift, type InsertShift,
  templates, type Template, type InsertTemplate
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define the storage interface with all required CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Handover log operations
  getHandoverLogs(): Promise<HandoverLog[]>;
  getHandoverLogById(id: number): Promise<HandoverLog | undefined>;
  getHandoverLogsByUser(userId: number): Promise<HandoverLog[]>;
  createHandoverLog(log: InsertHandoverLog): Promise<HandoverLog>;
  updateHandoverLog(id: number, log: Partial<InsertHandoverLog>): Promise<HandoverLog | undefined>;
  
  // Incident operations
  getIncidents(): Promise<Incident[]>;
  getIncidentById(id: number): Promise<Incident | undefined>;
  getActiveIncidents(): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident | undefined>;
  
  // Task operations
  getTasks(): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  getTasksByAssignee(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Shift operations
  getShifts(): Promise<Shift[]>;
  getShiftById(id: number): Promise<Shift | undefined>;
  getUpcomingShifts(limit: number): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: number, shift: Partial<InsertShift>): Promise<Shift | undefined>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplateById(id: number): Promise<Template | undefined>;
  getTemplatesByType(type: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private handoverLogs: Map<number, HandoverLog>;
  private incidents: Map<number, Incident>;
  private tasks: Map<number, Task>;
  private shifts: Map<number, Shift>;
  private templates: Map<number, Template>;

  // IDs for auto-increment
  private userIdCounter: number;
  private logIdCounter: number;
  private incidentIdCounter: number;
  private taskIdCounter: number;
  private shiftIdCounter: number;
  private templateIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.handoverLogs = new Map();
    this.incidents = new Map();
    this.tasks = new Map();
    this.shifts = new Map();
    this.templates = new Map();
    
    this.userIdCounter = 1;
    this.logIdCounter = 1;
    this.incidentIdCounter = 1;
    this.taskIdCounter = 1;
    this.shiftIdCounter = 1;
    this.templateIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Adding some initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Handover log operations
  async getHandoverLogs(): Promise<HandoverLog[]> {
    return Array.from(this.handoverLogs.values());
  }

  async getHandoverLogById(id: number): Promise<HandoverLog | undefined> {
    return this.handoverLogs.get(id);
  }

  async getHandoverLogsByUser(userId: number): Promise<HandoverLog[]> {
    return Array.from(this.handoverLogs.values()).filter(
      (log) => log.userId === userId,
    );
  }

  async createHandoverLog(log: InsertHandoverLog): Promise<HandoverLog> {
    const id = this.logIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const handoverLog: HandoverLog = { ...log, id, createdAt, updatedAt };
    this.handoverLogs.set(id, handoverLog);
    return handoverLog;
  }

  async updateHandoverLog(id: number, logUpdate: Partial<InsertHandoverLog>): Promise<HandoverLog | undefined> {
    const log = this.handoverLogs.get(id);
    if (!log) return undefined;
    
    const updatedLog = { ...log, ...logUpdate, updatedAt: new Date() };
    this.handoverLogs.set(id, updatedLog);
    return updatedLog;
  }

  // Incident operations
  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async getIncidentById(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      (incident) => incident.status === 'active',
    );
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const id = this.incidentIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newIncident: Incident = { ...incident, id, createdAt, updatedAt };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  async updateIncident(id: number, incidentUpdate: Partial<InsertIncident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident = { ...incident, ...incidentUpdate, updatedAt: new Date() };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedTo === userId,
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newTask: Task = { ...task, id, createdAt, updatedAt };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate, updatedAt: new Date() };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Shift operations
  async getShifts(): Promise<Shift[]> {
    return Array.from(this.shifts.values());
  }

  async getShiftById(id: number): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }

  async getUpcomingShifts(limit: number): Promise<Shift[]> {
    return Array.from(this.shifts.values())
      .filter(shift => new Date(shift.startTime) > new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit);
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const id = this.shiftIdCounter++;
    const newShift: Shift = { ...shift, id };
    this.shifts.set(id, newShift);
    return newShift;
  }

  async updateShift(id: number, shiftUpdate: Partial<InsertShift>): Promise<Shift | undefined> {
    const shift = this.shifts.get(id);
    if (!shift) return undefined;
    
    const updatedShift = { ...shift, ...shiftUpdate };
    this.shifts.set(id, updatedShift);
    return updatedShift;
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplateById(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getTemplatesByType(type: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.type === type,
    );
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.templateIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newTemplate: Template = { ...template, id, createdAt, updatedAt };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: number, templateUpdate: Partial<InsertTemplate>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...templateUpdate, updatedAt: new Date() };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  // Seed with initial data for testing
  private seedData() {
    // This is just for testing and initial setup
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    
    // Create sample shifts for today and tomorrow
    const morningStart = new Date(now);
    morningStart.setHours(8, 0, 0, 0);
    const morningEnd = new Date(now);
    morningEnd.setHours(16, 0, 0, 0);
    
    const eveningStart = new Date(now);
    eveningStart.setHours(16, 0, 0, 0);
    const eveningEnd = new Date(now);
    eveningEnd.setHours(0, 0, 0, 0);
    eveningEnd.setDate(eveningEnd.getDate() + 1);
    
    const nightStart = new Date(now);
    nightStart.setHours(0, 0, 0, 0);
    const nightEnd = new Date(now);
    nightEnd.setHours(8, 0, 0, 0);
    
    const tomorrowMorningStart = new Date(tomorrow);
    tomorrowMorningStart.setHours(8, 0, 0, 0);
    const tomorrowMorningEnd = new Date(tomorrow);
    tomorrowMorningEnd.setHours(16, 0, 0, 0);
  }
}

export const storage = new MemStorage();
