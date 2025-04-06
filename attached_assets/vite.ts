import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger, type ServerOptions } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions: ServerOptions = {
    middlewareMode: true,
    hmr: { server },
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: {
      ...viteConfig.server,
      ...serverOptions,
    },
    appType: "custom",
    root: path.resolve(__dirname, "..", "client"), // Set root to client directory
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplatePath = path.resolve(__dirname, "..", "client", "index.html");
      const mainTsxPath = path.resolve(__dirname, "..", "client", "src", "main.tsx");

      // Check if files exist
      if (!fs.existsSync(clientTemplatePath)) {
        throw new Error(`Client template not found at ${clientTemplatePath}`);
      }
      if (!fs.existsSync(mainTsxPath)) {
        throw new Error(`main.tsx not found at ${mainTsxPath}`);
      }

      console.log(`Serving ${url}, loading template from ${clientTemplatePath}`);
      let template = await fs.promises.readFile(clientTemplatePath, "utf-8");

      // Ensure the replacement matches the actual script tag in index.html
      const scriptPattern = /src=["'](.*main\.tsx)["']/;
      if (!scriptPattern.test(template)) {
        console.warn("main.tsx script not found in index.html");
      }
      template = template.replace(
        scriptPattern,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      console.error(`Error serving ${url}:`, e);
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}