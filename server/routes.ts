import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { LogStatus, LogType, ShiftType, IncidentPriority, IncidentStatus } from "@shared/schema";
import { analyzeHandoverContent, generateHandoverRecommendations } from "./ai";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // API Routes
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
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
  
  // Get AI analysis by log ID
  app.get("/api/ai-analysis/:logId", async (req, res) => {
    try {
      const { logId } = req.params;
      const analysis = await storage.getAiAnalysisByLogId(parseInt(logId));
      
      if (!analysis) {
        return res.status(404).json({ message: "AI analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI analysis" });
    }
  });
  
  // Get AI recommendations based on recent logs
  app.get("/api/ai-recommendations", async (req, res) => {
    try {
      const handoverLogs = await storage.getHandoverLogs();
      
      // Sort by most recent first and take the last 5
      const recentLogs = handoverLogs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(log => log.content);
      
      const recommendations = await generateHandoverRecommendations(recentLogs);
      
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI recommendations" });
    }
  });
  
  // Get templates with AI-generated option
  app.get("/api/templates", async (req, res) => {
    try {
      const { type } = req.query;
      
      const templates = type 
        ? await storage.getTemplatesByType(type as string)
        : await storage.getTemplates();
      
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  
  // Get template by ID
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const template = await storage.getTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });
  
  // Update template
  app.put("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const { title, type, content } = req.body;
      if (!title || !type || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const updatedTemplate = await storage.updateTemplate(id, { title, type, content });
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update template" });
    }
  });
  
  // Delete template
  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      // Update the storage interface to support deleteTemplate
      const success = await storage.deleteTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });
  
  // Create new handover log
  app.post("/api/handovers", async (req, res) => {
    try {
      const { shift, type, content, userId } = req.body;
      
      if (!shift || !type || !content || !userId) {
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
        userId,
        shift,
        type,
        status: LogStatus.PENDING_REVIEW,
        content,
        comments: aiSuggestions ? JSON.stringify(aiSuggestions) : null,
        reviewedBy: null,
        reviewedAt: null
      });
      
      // If AI suggestions are available, store them separately
      if (aiSuggestions) {
        await storage.createAiAnalysis({
          logId: newLog.id,
          category: aiSuggestions.category,
          importance: aiSuggestions.importance,
          suggestions: aiSuggestions.suggestions,
          keywords: aiSuggestions.keywords,
          followUpActions: aiSuggestions.followUpActions || [],
        });
      }
      
      res.status(201).json(newLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to create handover log" });
    }
  });
  
  // Create new incident
  app.post("/api/incidents", async (req, res) => {
    try {
      const { title, description, priority, reportedBy } = req.body;
      
      if (!title || !description || !priority || !reportedBy) {
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
        reportedBy,
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
    try {
      const { title, description, assignedTo, createdBy } = req.body;
      
      if (!title || !description || !assignedTo || !createdBy) {
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
        createdBy,
        status: "pending",
        completedAt: null
      });
      
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  // Create new shift
  app.post("/api/shifts", async (req, res) => {
    try {
      const { shiftType, startTime, endTime, users } = req.body;
      
      if (!shiftType || !startTime || !endTime || !users || !users.length) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate shift type
      if (!Object.values(ShiftType).includes(shiftType)) {
        return res.status(400).json({ message: "Invalid shift type" });
      }
      
      const newShift = await storage.createShift({
        shiftType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        users
      });
      
      res.status(201).json(newShift);
    } catch (error) {
      res.status(500).json({ message: "Failed to create shift" });
    }
  });
  
  // Generate AI template
  app.post("/api/templates/generate", async (req, res) => {
    try {
      const { type, createdBy } = req.body;
      
      if (!type || !createdBy) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Use the OpenAI integration to generate a template based on the type
      const prompt = `Create a detailed template for a ${type} report in a coal mine operation. Include all necessary sections, fields, and instructions.`;
      
      // In a real implementation, you would call OpenAI here
      // For now, we'll simulate a response
      const content = `## ${type.charAt(0).toUpperCase() + type.slice(1)} Report Template\n\n**Date:** [DATE]\n\n**Author:** [NAME]\n\n**Location:** [LOCATION]\n\n**Details:**\n\n**Findings:**\n\n**Recommendations:**\n\n**Follow-up Actions:**\n`;
      
      const newTemplate = await storage.createTemplate({
        title: `AI-Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Template`,
        type,
        content,
        createdBy,
        isAiGenerated: true
      });
      
      res.status(201).json(newTemplate);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate template" });
    }
  });
  
  // Update handover log status
  app.patch("/api/handovers/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments, reviewedBy } = req.body;
      
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
        updateData.reviewedBy = reviewedBy;
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
  
  // Update incident 
  app.patch("/api/incidents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, priority, status } = req.body;
      
      // At least one field should be provided for update
      if (!title && !description && !priority && !status) {
        return res.status(400).json({ message: "At least one field is required for update" });
      }
      
      const incident = await storage.getIncidentById(parseInt(id));
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      // Create update data object
      const updateData: any = {};
      
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (priority) {
        // Validate priority
        if (!Object.values(IncidentPriority).includes(priority)) {
          return res.status(400).json({ message: "Invalid priority level" });
        }
        updateData.priority = priority;
      }
      if (status) {
        // Validate status
        if (!Object.values(IncidentStatus).includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }
        updateData.status = status;
      }
      
      const updatedIncident = await storage.updateIncident(parseInt(id), updateData);
      
      res.json(updatedIncident);
    } catch (error) {
      res.status(500).json({ message: "Failed to update incident" });
    }
  });
  
  // Resolve incident
  app.patch("/api/incidents/:id/resolve", async (req, res) => {
    try {
      const { id } = req.params;
      const { resolvedBy } = req.body;
      
      if (!resolvedBy) {
        return res.status(400).json({ message: "Resolver ID is required" });
      }
      
      const incident = await storage.getIncidentById(parseInt(id));
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      const resolvedIncident = await storage.updateIncident(parseInt(id), {
        status: IncidentStatus.RESOLVED,
        resolvedBy,
        resolvedAt: new Date()
      });
      
      res.json(resolvedIncident);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve incident" });
    }
  });
  
  // Complete task
  app.patch("/api/tasks/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      
      const task = await storage.getTaskById(parseInt(id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
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
