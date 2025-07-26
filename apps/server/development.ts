import express, { type Express } from "express";
import { type Server } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  app.use("*", async (req, res, next) => {
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
        const template = await fs.promises.readFile(clientTemplate, "utf-8");
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        res.status(404).json({ error: "Client not built" });
      }
    } catch (e) {
      next(e);
    }
  });
} 