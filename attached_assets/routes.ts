import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { LogStatus, LogType, ShiftType, IncidentPriority, IncidentStatus } from "@shared/schema";
import { analyzeHandoverContent } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API Routes
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const [handoverLogs, incidents, tasks] = await Promise.all([
        storage.getHandoverLogs(),
        storage.getIncidents(),
        storage.getTasks(),
      ]);
      
      const pendingHandovers = handoverLogs.filter(log => 
        log.status === LogStatus.PENDING_REVIEW || log.status === LogStatus.REQUIRES_ATTENTION
      ).length;
      
      const requiresAttention = handoverLogs.filter(log => 
        log.status === LogStatus.REQUIRES_ATTENTION
      ).length;
      
      const activeIncidents = incidents.filter(incident =>
        incident.status === IncidentStatus.ACTIVE
      );
      
      const activeIncidentsCount = activeIncidents.length;
      const highPriorityIncidents = activeIncidents.filter(inc => 
        inc.priority === IncidentPriority.HIGH
      ).length;
      
      const completedToday = handoverLogs.filter(log => {
        const today = new Date();
        const logDate = new Date(log.createdAt);
        return log.status === LogStatus.COMPLETED && 
               logDate.getDate() === today.getDate() &&
               logDate.getMonth() === today.getMonth() &&
               logDate.getFullYear() === today.getFullYear();
      }).length;
      
      // For the mock data, assume 3 more than yesterday
      const completedYesterday = completedToday - 3;
      
      const openTasks = tasks.filter(task => task.status !== 'completed').length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? Math.round((totalTasks - openTasks) / totalTasks * 100) : 0;
      
      res.json({
        pendingHandovers,
        requiresAttention,
        activeIncidents: activeIncidentsCount,
        highPriorityIncidents,
        completedToday,
        completedYesterday,
        openTasks,
        completionRate,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  // Get handover logs with pagination
  app.get("/api/handovers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const handoverLogs = await storage.getHandoverLogs();
      
      // Sort by most recent first
      const sortedLogs = handoverLogs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Get users for each log
      const logResults = await Promise.all(sortedLogs.map(async (log) => {
        const user = await storage.getUser(log.userId);
        return {
          ...log,
          user: user ? { 
            id: user.id, 
            fullName: user.fullName, 
            initials: user.initials 
          } : undefined
        };
      }));
      
      res.json(logResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch handover logs" });
    }
  });
  
  // Get active incidents
  app.get("/api/incidents/active", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const activeIncidents = await storage.getActiveIncidents();
      
      // Get reporter for each incident
      const incidentResults = await Promise.all(activeIncidents.map(async (incident) => {
        const reporter = await storage.getUser(incident.reportedBy);
        return {
          ...incident,
          reporter: reporter ? { 
            id: reporter.id, 
            fullName: reporter.fullName, 
            initials: reporter.initials 
          } : undefined
        };
      }));
      
      res.json(incidentResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active incidents" });
    }
  });
  
  // Get upcoming shifts
  app.get("/api/shifts/upcoming", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const upcoming = await storage.getUpcomingShifts(3);
      
      // Enrich with user details
      const shiftResults = await Promise.all(upcoming.map(async (shift) => {
        const userDetails = await Promise.all(shift.users.map(async (userId) => {
          const user = await storage.getUser(parseInt(userId));
          return user ? { 
            id: user.id, 
            fullName: user.fullName, 
            initials: user.initials 
          } : null;
        }));
        
        return {
          ...shift,
          userDetails: userDetails.filter(u => u !== null)
        };
      }));
      
      res.json(shiftResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming shifts" });
    }
  });
  
  // Create new handover log
  app.post("/api/handovers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { shift, type, content } = req.body;
      
      if (!shift || !type || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate input
      if (!Object.values(ShiftType).includes(shift)) {
        return res.status(400).json({ message: "Invalid shift type" });
      }
      
      if (!Object.values(LogType).includes(type)) {
        return res.status(400).json({ message: "Invalid log type" });
      }
      
      // Generate log number (format: HL-XXXX)
      const logs = await storage.getHandoverLogs();
      const logNumber = `HL-${(logs.length + 1001).toString().substring(1)}`;
      
      // AI analysis for content categorization and recommendations
      let aiSuggestions = null;
      try {
        aiSuggestions = await analyzeHandoverContent(content, type);
      } catch (error) {
        console.error("AI analysis failed:", error);
        // Continue without AI analysis if it fails
      }
      
      const newLog = await storage.createHandoverLog({
        logNumber,
        userId: req.user.id,
        shift,
        type,
        status: LogStatus.PENDING_REVIEW,
        content,
        comments: aiSuggestions ? JSON.stringify(aiSuggestions) : null,
        reviewedBy: null,
        reviewedAt: null
      });
      
      res.status(201).json(newLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to create handover log" });
    }
  });
  
  // Create new incident
  app.post("/api/incidents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { title, description, priority } = req.body;
      
      if (!title || !description || !priority) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate priority
      if (!Object.values(IncidentPriority).includes(priority)) {
        return res.status(400).json({ message: "Invalid priority level" });
      }
      
      const newIncident = await storage.createIncident({
        title,
        description,
        priority,
        status: IncidentStatus.ACTIVE,
        reportedBy: req.user.id,
        resolvedBy: null,
        resolvedAt: null
      });
      
      res.status(201).json(newIncident);
    } catch (error) {
      res.status(500).json({ message: "Failed to create incident" });
    }
  });
  
  // Create new task
  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { title, description, assignedTo } = req.body;
      
      if (!title || !description || !assignedTo) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate assignee exists
      const assignee = await storage.getUser(assignedTo);
      if (!assignee) {
        return res.status(400).json({ message: "Invalid assignee" });
      }
      
      const newTask = await storage.createTask({
        title,
        description,
        assignedTo,
        createdBy: req.user.id,
        status: "pending",
        completedAt: null
      });
      
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  // Update handover log status
  app.patch("/api/handovers/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      const { status, comments } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Validate status
      if (!Object.values(LogStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const log = await storage.getHandoverLogById(parseInt(id));
      if (!log) {
        return res.status(404).json({ message: "Handover log not found" });
      }
      
      // If status is changing to COMPLETED, add reviewer info
      const updateData: any = { status };
      if (status === LogStatus.COMPLETED) {
        updateData.reviewedBy = req.user.id;
        updateData.reviewedAt = new Date();
      }
      
      // Add comments if provided
      if (comments !== undefined) {
        updateData.comments = comments;
      }
      
      const updatedLog = await storage.updateHandoverLog(parseInt(id), updateData);
      
      res.json(updatedLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update handover log status" });
    }
  });
  
  // Resolve incident
  app.patch("/api/incidents/:id/resolve", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      
      const incident = await storage.getIncidentById(parseInt(id));
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      const resolvedIncident = await storage.updateIncident(parseInt(id), {
        status: IncidentStatus.RESOLVED,
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      });
      
      res.json(resolvedIncident);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve incident" });
    }
  });
  
  // Complete task
  app.patch("/api/tasks/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      
      const task = await storage.getTaskById(parseInt(id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user is assigned to the task
      if (task.assignedTo !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to complete this task" });
      }
      
      const completedTask = await storage.updateTask(parseInt(id), {
        status: "completed",
        completedAt: new Date()
      });
      
      res.json(completedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
