import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  
  console.log(`🔍 Looking for static files in: ${distPath}`);
  console.log(`📁 Directory exists: ${fs.existsSync(distPath)}`);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Проверяем содержимое папки
  try {
    const files = fs.readdirSync(distPath);
    console.log(`📂 Files in dist/public:`, files);
    
    if (fs.existsSync(path.join(distPath, 'css'))) {
      const cssFiles = fs.readdirSync(path.join(distPath, 'css'));
      console.log(`🎨 CSS files:`, cssFiles);
    }
    
    if (fs.existsSync(path.join(distPath, 'js'))) {
      const jsFiles = fs.readdirSync(path.join(distPath, 'js'));
      console.log(`📜 JS files:`, jsFiles.slice(0, 5)); // показываем первые 5
    }
  } catch (error) {
    console.error(`❌ Error reading dist/public:`, error);
  }

  console.log(`✅ Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`📄 Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
} 