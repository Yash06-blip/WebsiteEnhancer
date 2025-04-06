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

app.post('/api/register', async (req, res) => {
  console.log('Received registration request:', req.body);
  const { username, password, name: fullName, email, contact_no, role_id = 2 } = req.body;
  console.log('Parsed data:', { username, password, fullName, email, contact_no, role_id });

  if (!username || !password || !fullName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    console.log('Hashed password:', password_hash);

    console.log('Attempting to insert user into database...');
    const result = await db.insert(users).values({
      username,
      password_hash,
      role_id,
      name: fullName,
      email,
      contact_no,
      address: null,
      blood_group: null,
      work_experience: null
    });
    console.log('Insert result:', result); // Log the result

    const [newUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!newUser) {
      throw new Error('Failed to retrieve inserted user');
    }
    console.log('Retrieved new user:', newUser);

    const frontendUser = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.name,
      role: newUser.role_id === 2 ? 'miner' : 'manager',
      initials: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };
    res.json({ message: 'User registered', ...frontendUser });
  } catch (err: any) {
    console.error('Database insert error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', ...req.user });
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