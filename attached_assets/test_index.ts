import { eq } from 'drizzle-orm';
import express, { type Request, Response, NextFunction } from "express";
import passport from 'passport';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from './db';
import { users } from './schema';
import bcrypt from 'bcrypt';
import './passport';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

app.post('/api/signup', async (req, res) => {
  const { username, password, name, email, contact_no, role_id = 2 } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  try {
    await db.insert(users).values({ 
      username, 
      password_hash, 
      role_id, 
      name, 
      email, 
      contact_no 
    });
    const [newUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    res.json({ message: 'User registered', id: newUser.id });
  } catch (err) {
    res.status(400).json({ error: 'Username or email already exists' });
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', user: req.user });
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 8081;
  server.listen({
    port,
    host: "127.0.0.1",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();