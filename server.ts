import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "webdav";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;
  // Bind to loopback by default: these endpoints relay caller-supplied
  // credentials to a caller-supplied URL, so they must not be reachable
  // from the local network unless explicitly opted into.
  const HOST = process.env.HOST ?? "127.0.0.1";

  app.use(express.json({ limit: '50mb' }));

  const BACKUP_PATH = "/bookmark_manager_backup.json";

  // Reject anything that isn't a plain http(s) WebDAV endpoint so this route
  // can't be used to probe internal services or non-HTTP protocols.
  function parseWebdavRequest(body: any): { url: string; username: string; password: string } {
    const { url, username, password } = body ?? {};
    if (typeof url !== "string" || typeof username !== "string" || typeof password !== "string") {
      throw new Error("Missing or invalid url/username/password");
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("Invalid WebDAV URL");
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("WebDAV URL must use http or https");
    }
    return { url, username, password };
  }

  // API Route for WebDAV Backup (per-profile path)
  app.post("/api/webdav/backup", async (req, res) => {
    try {
      const { url, username, password } = parseWebdavRequest(req.body);
      const { data, path } = req.body;
      const filePath = typeof path === 'string' && path ? path : BACKUP_PATH;
      const client = createClient(url, { username, password });
      
      await client.putFileContents(filePath, JSON.stringify(data), { overwrite: true });
      res.json({ success: true });
    } catch (error: any) {
      console.error('WebDAV Backup Error:', error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // API Route for WebDAV Restore (per-profile path)
  app.post("/api/webdav/restore", async (req, res) => {
    try {
      const { url, username, password } = parseWebdavRequest(req.body);
      const { path } = req.body;
      const filePath = typeof path === 'string' && path ? path : BACKUP_PATH;
      const client = createClient(url, { username, password });
      
      const exists = await client.exists(filePath);
      if (!exists) {
        return res.status(404).json({ error: "Backup file not found on WebDAV server" });
      }

      const buffer = await client.getFileContents(filePath, { format: "text" });
      let data;
      if (typeof buffer === 'string') {
        data = JSON.parse(buffer);
      } else {
        data = JSON.parse(buffer.toString('utf8'));
      }
      
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('WebDAV Restore Error:', error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // Peek remote backup metadata (for conflict detection)
  app.post("/api/webdav/peek", async (req, res) => {
    try {
      const { url, username, password } = parseWebdavRequest(req.body);
      const { path } = req.body;
      const filePath = typeof path === 'string' && path ? path : BACKUP_PATH;
      const client = createClient(url, { username, password });
      
      const exists = await client.exists(filePath);
      if (!exists) {
        return res.json({ exists: false, updatedAt: 0 });
      }
      const buffer = await client.getFileContents(filePath, { format: "text" });
      let data;
      if (typeof buffer === 'string') {
        data = JSON.parse(buffer);
      } else {
        data = JSON.parse(buffer.toString('utf8'));
      }
      res.json({ exists: true, updatedAt: data?.updatedAt || 0 });
    } catch (error: any) {
      console.error('WebDAV Peek Error:', error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // Copy remote backup to a conflict file (preserve remote before overwrite)
  app.post("/api/webdav/conflict", async (req, res) => {
    try {
      const { url, username, password } = parseWebdavRequest(req.body);
      const { path, conflictPath } = req.body;
      const filePath = typeof path === 'string' && path ? path : BACKUP_PATH;
      const destPath = typeof conflictPath === 'string' && conflictPath ? conflictPath : `${filePath}.conflict`;
      const client = createClient(url, { username, password });
      
      const exists = await client.exists(filePath);
      if (!exists) {
        return res.json({ success: true, skipped: true });
      }
      const buffer = await client.getFileContents(filePath, { format: 'text' });
      await client.putFileContents(destPath, buffer as string, { overwrite: true });
      res.json({ success: true });
    } catch (error: any) {
      console.error('WebDAV Conflict Copy Error:', error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
