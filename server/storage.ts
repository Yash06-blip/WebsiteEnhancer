import { 
  users, type User, type InsertUser,
  handoverLogs, type HandoverLog, type InsertHandoverLog,
  incidents, type Incident, type InsertIncident,
  tasks, type Task, type InsertTask,
  shifts, type Shift, type InsertShift,
  templates, type Template, type InsertTemplate,
  aiAnalysis, type AiAnalysis, type InsertAiAnalysis,
  attendance, type Attendance, type InsertAttendance,
  geofenceZones, type GeofenceZone, type InsertGeofenceZone,
  LogStatus, IncidentStatus, IncidentPriority, ShiftType, LogType
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, desc, gt, asc, and, isNull, inArray, lte, gte } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PgSessionStore = connectPgSimple(session);

// Define the storage interface with all required CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
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
  deleteTemplate(id: number): Promise<boolean>;
  
  // AI analysis operations
  getAiAnalysisByLogId(logId: number): Promise<AiAnalysis | undefined>;
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  
  // Geofence operations
  getGeofenceZones(): Promise<GeofenceZone[]>;
  getGeofenceZoneById(id: number): Promise<GeofenceZone | undefined>;
  createGeofenceZone(zone: InsertGeofenceZone): Promise<GeofenceZone>;
  updateGeofenceZone(id: number, zone: Partial<InsertGeofenceZone>): Promise<GeofenceZone | undefined>;
  deleteGeofenceZone(id: number): Promise<boolean>;
  
  // Attendance operations
  getAttendanceRecords(): Promise<Attendance[]>;
  getAttendanceById(id: number): Promise<Attendance | undefined>;
  getAttendanceByUser(userId: number): Promise<Attendance[]>;
  getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<Attendance[]>;
  getUsersCurrentlyInZone(zoneId: number): Promise<User[]>;
  checkUserInZone(userId: number, coordinates: string): Promise<boolean>;
  createAttendanceRecord(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendanceRecord(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  
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
  private aiAnalyses: Map<number, AiAnalysis>;
  private geofenceZones: Map<number, GeofenceZone>;
  private attendanceRecords: Map<number, Attendance>;

  // IDs for auto-increment
  private userIdCounter: number;
  private logIdCounter: number;
  private incidentIdCounter: number;
  private taskIdCounter: number;
  private shiftIdCounter: number;
  private templateIdCounter: number;
  private aiAnalysisIdCounter: number;
  private geofenceZoneIdCounter: number;
  private attendanceIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.handoverLogs = new Map();
    this.incidents = new Map();
    this.tasks = new Map();
    this.shifts = new Map();
    this.templates = new Map();
    this.aiAnalyses = new Map();
    this.geofenceZones = new Map();
    this.attendanceRecords = new Map();
    
    this.userIdCounter = 1;
    this.logIdCounter = 1;
    this.incidentIdCounter = 1;
    this.taskIdCounter = 1;
    this.shiftIdCounter = 1;
    this.templateIdCounter = 1;
    this.aiAnalysisIdCounter = 1;
    this.geofenceZoneIdCounter = 1;
    this.attendanceIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
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
  
  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
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
      (incident) => incident.status === IncidentStatus.ACTIVE,
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
  
  async deleteTemplate(id: number): Promise<boolean> {
    if (!this.templates.has(id)) return false;
    
    return this.templates.delete(id);
  }

  // AI analysis operations
  async getAiAnalysisByLogId(logId: number): Promise<AiAnalysis | undefined> {
    // First try to find in the existing analyses
    const existingAnalysis = Array.from(this.aiAnalyses.values()).find(
      (analysis) => analysis.logId === logId,
    );
    
    if (existingAnalysis) {
      return existingAnalysis;
    }
    
    // If not found, create a mock analysis for demo purposes
    const mockAnalysis: AiAnalysis = {
      id: this.aiAnalysisIdCounter++,
      logId: logId,
      category: "Safety",
      importance: "medium",
      suggestions: [
        "Ensure proper documentation of ventilation readings in section B",
        "Follow up with maintenance team regarding equipment repair status",
        "Update shift handover logs with detailed information about ongoing tasks"
      ],
      keywords: ["ventilation", "safety", "maintenance", "documentation", "handover"],
      followUpActions: [
        "Schedule inspection of ventilation system in section B",
        "Verify completion of maintenance tasks from previous shift"
      ],
      createdAt: new Date()
    };
    
    // Store for future use
    this.aiAnalyses.set(mockAnalysis.id, mockAnalysis);
    
    return mockAnalysis;
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const id = this.aiAnalysisIdCounter++;
    const createdAt = new Date();
    const newAnalysis: AiAnalysis = { ...analysis, id, createdAt };
    this.aiAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  // Geofence operations
  async getGeofenceZones(): Promise<GeofenceZone[]> {
    return Array.from(this.geofenceZones.values());
  }

  async getGeofenceZoneById(id: number): Promise<GeofenceZone | undefined> {
    return this.geofenceZones.get(id);
  }

  async createGeofenceZone(zone: InsertGeofenceZone): Promise<GeofenceZone> {
    const id = this.geofenceZoneIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newZone: GeofenceZone = { ...zone, id, createdAt, updatedAt };
    this.geofenceZones.set(id, newZone);
    return newZone;
  }

  async updateGeofenceZone(id: number, zoneUpdate: Partial<InsertGeofenceZone>): Promise<GeofenceZone | undefined> {
    const zone = this.geofenceZones.get(id);
    if (!zone) return undefined;
    
    const updatedZone = { ...zone, ...zoneUpdate, updatedAt: new Date() };
    this.geofenceZones.set(id, updatedZone);
    return updatedZone;
  }
  
  async deleteGeofenceZone(id: number): Promise<boolean> {
    if (!this.geofenceZones.has(id)) return false;
    
    return this.geofenceZones.delete(id);
  }
  
  // Attendance operations
  async getAttendanceRecords(): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values());
  }

  async getAttendanceById(id: number): Promise<Attendance | undefined> {
    return this.attendanceRecords.get(id);
  }

  async getAttendanceByUser(userId: number): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      (record) => record.userId === userId,
    );
  }

  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      (record) => {
        const recordDate = new Date(record.checkInTime);
        return recordDate >= startDate && recordDate <= endDate;
      }
    );
  }

  async getUsersCurrentlyInZone(zoneId: number): Promise<User[]> {
    // Get zone coordinates
    const zone = this.geofenceZones.get(zoneId);
    if (!zone) return [];
    
    // Get users with active attendance records (no checkout time)
    const activeAttendanceRecords = Array.from(this.attendanceRecords.values()).filter(
      (record) => !record.checkOutTime && record.isValid
    );
    
    // Get unique user IDs from active records
    const userIds = [...new Set(activeAttendanceRecords.map(record => record.userId))];
    
    // Get user objects
    const users = userIds
      .map(id => this.users.get(id))
      .filter((user): user is User => user !== undefined);
      
    return users;
  }

  async checkUserInZone(userId: number, coordinates: string): Promise<boolean> {
    // For demo purposes, just return true to allow check-ins
    // In a real implementation, this would check if the provided coordinates
    // are within any of the defined geofence zones
    return true;
  }

  async createAttendanceRecord(attendance: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceIdCounter++;
    const createdAt = new Date();
    const newRecord: Attendance = { ...attendance, id, createdAt };
    this.attendanceRecords.set(id, newRecord);
    return newRecord;
  }

  async updateAttendanceRecord(id: number, attendanceUpdate: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const record = this.attendanceRecords.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { ...record, ...attendanceUpdate };
    this.attendanceRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  // Seed with initial data for testing
  private seedData() {
    // Create sample users
    const adminUser: InsertUser = {
      username: "admin",
      password: "$2b$10$5u7hrKfX9EGGjGHrXWi9n.uYCw.KS8UtPXv.iMJO/NiKX0nIcHb.K", // "password"
      fullName: "John Doe",
      role: 1, // Manager
      initials: "JD",
      email: "admin@example.com",
      contact: "+123456789",
    };
    
    const minerUser: InsertUser = {
      username: "miner1",
      password: "$2b$10$5u7hrKfX9EGGjGHrXWi9n.uYCw.KS8UtPXv.iMJO/NiKX0nIcHb.K", // "password"
      fullName: "Robert Kumar",
      role: 2, // Miner
      initials: "RK",
      email: "miner1@example.com",
      contact: "+123456789",
    };
    
    this.createUser(adminUser);
    this.createUser(minerUser);
    
    // Create sample shifts for today and tomorrow
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
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
    
    this.createShift({
      shiftType: "morning",
      startTime: morningStart,
      endTime: morningEnd,
      users: ["1", "2"],
    });
    
    this.createShift({
      shiftType: "evening",
      startTime: eveningStart,
      endTime: eveningEnd,
      users: ["1"],
    });
    
    this.createShift({
      shiftType: "night",
      startTime: nightStart,
      endTime: nightEnd,
      users: ["2"],
    });
    
    this.createShift({
      shiftType: "morning",
      startTime: tomorrowMorningStart,
      endTime: tomorrowMorningEnd,
      users: ["1", "2"],
    });
    
    // Create sample handover logs
    this.createHandoverLog({
      logNumber: "HL-1001",
      userId: 1,
      shift: "morning",
      type: "statutory",
      status: LogStatus.COMPLETED,
      content: "Completed regular checks on ventilation systems. All operating within normal parameters.",
      comments: "Approved",
      reviewedBy: 2,
      reviewedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
    });
    
    this.createHandoverLog({
      logNumber: "HL-1002",
      userId: 2,
      shift: "evening",
      type: "non-statutory",
      status: LogStatus.COMPLETED,
      content: "Equipment maintenance conducted on Conveyor Belt #3. Replaced worn parts and tested operation.",
      comments: "Maintenance log verified.",
      reviewedBy: 1,
      reviewedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    });
    
    this.createHandoverLog({
      logNumber: "HL-1003",
      userId: 1,
      shift: "night",
      type: "statutory",
      status: LogStatus.PENDING_REVIEW,
      content: "Safety checks completed. Minor issues with lighting in Section B.",
      comments: null,
      reviewedBy: null,
      reviewedAt: null,
    });
    
    this.createHandoverLog({
      logNumber: "HL-1004",
      userId: 2,
      shift: "morning",
      type: "statutory",
      status: LogStatus.REQUIRES_ATTENTION,
      content: "Elevated methane levels detected in Section B3. Within safe limits but needs monitoring.",
      comments: "Please provide more detailed readings and monitoring schedule.",
      reviewedBy: 1,
      reviewedAt: new Date(),
    });
    
    // Create sample incidents
    this.createIncident({
      title: "Water leakage in shaft B",
      description: "Water seepage detected in the main tunnel of shaft B. Emergency team dispatched. Requires immediate attention.",
      priority: IncidentPriority.HIGH,
      status: IncidentStatus.ACTIVE,
      reportedBy: 2,
      resolvedBy: null,
      resolvedAt: null,
    });
    
    this.createIncident({
      title: "Conveyor belt malfunction",
      description: "Conveyor belt #3 experiencing intermittent stoppages. Maintenance team has been notified and repairs scheduled.",
      priority: IncidentPriority.MEDIUM,
      status: IncidentStatus.ACTIVE,
      reportedBy: 1,
      resolvedBy: null,
      resolvedAt: null,
    });
    
    this.createIncident({
      title: "Ventilation issue in Section C",
      description: "Reduced airflow detected in ventilation system for Section C. Engineers assessing the situation. Air quality within acceptable parameters.",
      priority: IncidentPriority.MEDIUM,
      status: IncidentStatus.ACTIVE,
      reportedBy: 2,
      resolvedBy: null,
      resolvedAt: null,
    });
    
    // Create sample tasks
    this.createTask({
      title: "Inspect ventilation fans",
      description: "Conduct routine inspection of all ventilation fans in Section A.",
      assignedTo: 2,
      createdBy: 1,
      status: "pending",
      completedAt: null,
    });
    
    this.createTask({
      title: "Safety equipment check",
      description: "Verify all safety equipment is properly functioning and document results.",
      assignedTo: 1,
      createdBy: 1,
      status: "completed",
      completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });
    
    this.createTask({
      title: "Maintenance on drilling equipment",
      description: "Perform scheduled maintenance on drilling equipment in Section B.",
      assignedTo: 2,
      createdBy: 1,
      status: "pending",
      completedAt: null,
    });
    
    // Create sample templates
    this.createTemplate({
      title: "Safety Inspection Report",
      type: "safety",
      content: "## Safety Inspection Report\n\n**Date:** [DATE]\n\n**Inspector:** [NAME]\n\n**Areas Inspected:**\n- [ ] Main Shaft\n- [ ] Section A\n- [ ] Section B\n- [ ] Section C\n\n**Findings:**\n\n**Recommendations:**\n\n**Action Items:**\n",
      createdBy: 1,
      isAiGenerated: false,
    });
    
    this.createTemplate({
      title: "Equipment Maintenance Log",
      type: "maintenance",
      content: "## Equipment Maintenance Log\n\n**Date:** [DATE]\n\n**Technician:** [NAME]\n\n**Equipment ID:** [ID]\n\n**Maintenance Type:**\n- [ ] Routine\n- [ ] Preventive\n- [ ] Corrective\n\n**Actions Performed:**\n\n**Parts Replaced:**\n\n**Test Results:**\n\n**Next Scheduled Maintenance:**\n",
      createdBy: 1,
      isAiGenerated: false,
    });
    
    this.createTemplate({
      title: "Incident Investigation Form",
      type: "incident",
      content: "## Incident Investigation Form\n\n**Incident Date/Time:** [DATE/TIME]\n\n**Location:** [LOCATION]\n\n**Reported By:** [NAME]\n\n**Incident Description:**\n\n**Root Cause Analysis:**\n\n**Corrective Actions:**\n\n**Preventive Measures:**\n\n**Follow-up Required:** Yes/No\n",
      createdBy: 1,
      isAiGenerated: false,
    });
    
    // Create sample AI analysis
    this.createAiAnalysis({
      logId: 4,
      category: "Safety",
      importance: "medium",
      suggestions: ["Increase monitoring frequency in Section B3", "Check ventilation system efficiency", "Review methane detection equipment calibration"],
      keywords: ["methane", "ventilation", "safety", "monitoring"],
      followUpActions: ["Schedule maintenance check for ventilation system", "Prepare detailed report on methane levels over past week"],
    });
    
    // Create sample geofence zones
    this.createGeofenceZone({
      name: "Main Shaft Entry",
      description: "The main entrance to the mine shaft",
      coordinates: "-33.865143,151.209900;-33.864143,151.209900;-33.864143,151.210900;-33.865143,151.210900",
      radius: 100,
      isActive: true,
      createdBy: 1
    });
    
    this.createGeofenceZone({
      name: "Section A Work Area",
      description: "The working area in Section A of the mine",
      coordinates: "-33.867143,151.211900;-33.866143,151.211900;-33.866143,151.212900;-33.867143,151.212900",
      radius: 50,
      isActive: true,
      createdBy: 1
    });
    
    this.createGeofenceZone({
      name: "Equipment Storage",
      description: "Equipment storage area with restricted access",
      coordinates: "-33.869143,151.213900;-33.868143,151.213900;-33.868143,151.214900;-33.869143,151.214900",
      radius: 30,
      isActive: true,
      createdBy: 1
    });
    
    // Create sample attendance records
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.createAttendanceRecord({
      userId: 1,
      checkInTime: new Date(yesterday.setHours(8, 0, 0)),
      checkOutTime: new Date(yesterday.setHours(16, 0, 0)),
      location: "Main Shaft Entry",
      coordinates: "-33.864643,151.210400",
      deviceId: "device-001",
      isValid: true
    });
    
    this.createAttendanceRecord({
      userId: 2,
      checkInTime: new Date(yesterday.setHours(8, 15, 0)),
      checkOutTime: new Date(yesterday.setHours(16, 30, 0)),
      location: "Main Shaft Entry",
      coordinates: "-33.864743,151.210500",
      deviceId: "device-002",
      isValid: true
    });
    
    // Create an active attendance record (no checkout time)
    const today = new Date();
    this.createAttendanceRecord({
      userId: 1,
      checkInTime: new Date(today.setHours(8, 0, 0)),
      checkOutTime: null,
      location: "Section A Work Area",
      coordinates: "-33.866643,151.212400",
      deviceId: "device-001",
      isValid: true
    });
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PgSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  // Handover log operations
  async getHandoverLogs(): Promise<HandoverLog[]> {
    return db.select().from(handoverLogs).orderBy(desc(handoverLogs.createdAt));
  }

  async getHandoverLogById(id: number): Promise<HandoverLog | undefined> {
    const result = await db.select().from(handoverLogs).where(eq(handoverLogs.id, id));
    return result[0];
  }

  async getHandoverLogsByUser(userId: number): Promise<HandoverLog[]> {
    return db.select()
      .from(handoverLogs)
      .where(eq(handoverLogs.userId, userId))
      .orderBy(desc(handoverLogs.createdAt));
  }

  async createHandoverLog(log: InsertHandoverLog): Promise<HandoverLog> {
    const now = new Date();
    const [newLog] = await db
      .insert(handoverLogs)
      .values({
        ...log,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newLog;
  }

  async updateHandoverLog(id: number, logUpdate: Partial<InsertHandoverLog>): Promise<HandoverLog | undefined> {
    const now = new Date();
    const [updatedLog] = await db
      .update(handoverLogs)
      .set({
        ...logUpdate,
        updatedAt: now
      })
      .where(eq(handoverLogs.id, id))
      .returning();
    return updatedLog;
  }

  // Incident operations
  async getIncidents(): Promise<Incident[]> {
    return db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncidentById(id: number): Promise<Incident | undefined> {
    const result = await db.select().from(incidents).where(eq(incidents.id, id));
    return result[0];
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return db.select()
      .from(incidents)
      .where(eq(incidents.status, IncidentStatus.ACTIVE))
      .orderBy(desc(incidents.createdAt));
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const now = new Date();
    const [newIncident] = await db
      .insert(incidents)
      .values({
        ...incident,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newIncident;
  }

  async updateIncident(id: number, incidentUpdate: Partial<InsertIncident>): Promise<Incident | undefined> {
    const now = new Date();
    const [updatedIncident] = await db
      .update(incidents)
      .set({
        ...incidentUpdate,
        updatedAt: now
      })
      .where(eq(incidents.id, id))
      .returning();
    return updatedIncident;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return db.select()
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const now = new Date();
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const now = new Date();
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...taskUpdate,
        updatedAt: now
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  // Shift operations
  async getShifts(): Promise<Shift[]> {
    return db.select().from(shifts).orderBy(asc(shifts.startTime));
  }

  async getShiftById(id: number): Promise<Shift | undefined> {
    const result = await db.select().from(shifts).where(eq(shifts.id, id));
    return result[0];
  }

  async getUpcomingShifts(limit: number): Promise<Shift[]> {
    const now = new Date();
    return db.select()
      .from(shifts)
      .where(gt(shifts.startTime, now))
      .orderBy(asc(shifts.startTime))
      .limit(limit);
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const [newShift] = await db
      .insert(shifts)
      .values(shift)
      .returning();
    return newShift;
  }

  async updateShift(id: number, shiftUpdate: Partial<InsertShift>): Promise<Shift | undefined> {
    const [updatedShift] = await db
      .update(shifts)
      .set(shiftUpdate)
      .where(eq(shifts.id, id))
      .returning();
    return updatedShift;
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates).orderBy(asc(templates.type));
  }

  async getTemplateById(id: number): Promise<Template | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id));
    return result[0];
  }

  async getTemplatesByType(type: string): Promise<Template[]> {
    return db.select()
      .from(templates)
      .where(eq(templates.type, type))
      .orderBy(desc(templates.createdAt));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const now = new Date();
    const [newTemplate] = await db
      .insert(templates)
      .values({
        ...template,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newTemplate;
  }

  async updateTemplate(id: number, templateUpdate: Partial<InsertTemplate>): Promise<Template | undefined> {
    const now = new Date();
    const [updatedTemplate] = await db
      .update(templates)
      .set({
        ...templateUpdate,
        updatedAt: now
      })
      .where(eq(templates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  async deleteTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(eq(templates.id, id));
    
    return result.rowCount > 0;
  }

  // AI analysis operations
  async getAiAnalysisByLogId(logId: number): Promise<AiAnalysis | undefined> {
    // First try to find in the database
    const result = await db
      .select()
      .from(aiAnalysis)
      .where(eq(aiAnalysis.logId, logId));
      
    if (result.length > 0) {
      return result[0];
    }
    
    // If not found, create a mock analysis for demo purposes
    const mockAnalysis: AiAnalysis = {
      id: 1000 + logId, // Use a high ID to avoid conflicts
      logId: logId,
      category: "Safety",
      importance: "medium",
      suggestions: [
        "Ensure proper documentation of ventilation readings in section B",
        "Follow up with maintenance team regarding equipment repair status",
        "Update shift handover logs with detailed information about ongoing tasks"
      ],
      keywords: ["ventilation", "safety", "maintenance", "documentation", "handover"],
      followUpActions: [
        "Schedule inspection of ventilation system in section B",
        "Verify completion of maintenance tasks from previous shift"
      ],
      createdAt: new Date()
    };
    
    // Store for future use
    await this.createAiAnalysis({
      logId: mockAnalysis.logId,
      category: mockAnalysis.category,
      importance: mockAnalysis.importance,
      suggestions: mockAnalysis.suggestions,
      keywords: mockAnalysis.keywords,
      followUpActions: mockAnalysis.followUpActions
    });
    
    return mockAnalysis;
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const now = new Date();
    const [newAnalysis] = await db
      .insert(aiAnalysis)
      .values({
        ...analysis,
        createdAt: now
      })
      .returning();
    return newAnalysis;
  }
  
  // Geofence operations
  async getGeofenceZones(): Promise<GeofenceZone[]> {
    return db.select().from(geofenceZones).orderBy(geofenceZones.name);
  }

  async getGeofenceZoneById(id: number): Promise<GeofenceZone | undefined> {
    const results = await db.select().from(geofenceZones).where(eq(geofenceZones.id, id));
    return results[0];
  }

  async createGeofenceZone(zone: InsertGeofenceZone): Promise<GeofenceZone> {
    const now = new Date();
    const [newZone] = await db
      .insert(geofenceZones)
      .values({
        ...zone,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newZone;
  }

  async updateGeofenceZone(id: number, zoneUpdate: Partial<InsertGeofenceZone>): Promise<GeofenceZone | undefined> {
    const now = new Date();
    const [updatedZone] = await db
      .update(geofenceZones)
      .set({
        ...zoneUpdate,
        updatedAt: now
      })
      .where(eq(geofenceZones.id, id))
      .returning();
    return updatedZone;
  }
  
  async deleteGeofenceZone(id: number): Promise<boolean> {
    const result = await db
      .delete(geofenceZones)
      .where(eq(geofenceZones.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Attendance operations
  async getAttendanceRecords(): Promise<Attendance[]> {
    return db.select().from(attendance).orderBy(desc(attendance.checkInTime));
  }

  async getAttendanceById(id: number): Promise<Attendance | undefined> {
    const results = await db.select().from(attendance).where(eq(attendance.id, id));
    return results[0];
  }

  async getAttendanceByUser(userId: number): Promise<Attendance[]> {
    return db.select()
      .from(attendance)
      .where(eq(attendance.userId, userId))
      .orderBy(desc(attendance.checkInTime));
  }

  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<Attendance[]> {
    return db.select()
      .from(attendance)
      .where(
        and(
          gte(attendance.checkInTime, startDate),
          lte(attendance.checkInTime, endDate)
        )
      )
      .orderBy(desc(attendance.checkInTime));
  }

  async getUsersCurrentlyInZone(zoneId: number): Promise<User[]> {
    // Get the zone
    const zoneResults = await db.select().from(geofenceZones).where(eq(geofenceZones.id, zoneId));
    const zone = zoneResults[0];
    if (!zone) return [];
    
    // Get active attendance records (no checkout time)
    const activeAttendanceRecords = await db.select()
      .from(attendance)
      .where(
        and(
          isNull(attendance.checkOutTime),
          eq(attendance.isValid, true)
        )
      );
    
    if (activeAttendanceRecords.length === 0) return [];
    
    // Get unique user IDs
    const userIds = [...new Set(activeAttendanceRecords.map(record => record.userId))];
    
    // Get users
    const userResults = await db.select()
      .from(users)
      .where(inArray(users.id, userIds));
      
    return userResults;
  }

  async checkUserInZone(userId: number, coordinates: string): Promise<boolean> {
    // For demo purposes, just return true
    // In a real implementation, this would check if the coordinates are within any geofence zone
    return true;
  }

  async createAttendanceRecord(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newRecord] = await db
      .insert(attendance)
      .values({
        ...attendanceData,
        createdAt: new Date()
      })
      .returning();
    return newRecord;
  }

  async updateAttendanceRecord(id: number, attendanceUpdate: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [updatedRecord] = await db
      .update(attendance)
      .set(attendanceUpdate)
      .where(eq(attendance.id, id))
      .returning();
    return updatedRecord;
  }
}

// Use DatabaseStorage instead of MemStorage for production use
export const storage = new DatabaseStorage();
