import express, { type Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

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
  // Простая настройка для разработки без Vite
  app.use(express.static(path.resolve(__dirname, "..", "client", "dist")));
  
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "dist",
        "index.html",
      );

      if (fs.existsSync(clientTemplate)) {
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        res.status(404).json({ error: "Client not built" });
      }
    } catch (e) {
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  console.log(`🔍 Looking for static files in: ${distPath}`);
  console.log(`📁 Directory exists: ${fs.existsSync(distPath)}`);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`✅ Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req: Request, res: Response) => {
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`📄 Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
}
