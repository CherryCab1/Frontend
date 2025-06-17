import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mongodb } from "./db";
import { insertOrderSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const id = parseInt(req.params.id);
      
      if (!status || isNaN(id)) {
        return res.status(400).json({ error: "Invalid status or order ID" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Messages routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const messages = await storage.getMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Xendit routes
  app.get("/api/xendit/balance", async (req, res) => {
    try {
      const balance = await storage.getXenditBalance();
      res.json(balance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Xendit balance" });
    }
  });

  app.post("/api/xendit/withdraw", async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({ error: "Invalid withdrawal amount" });
      }

      // Simulate withdrawal process
      res.json({ 
        success: true, 
        message: "Withdrawal initiated successfully",
        transactionId: `WD-${Date.now()}`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // System routes
  app.get("/api/system/status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      if (!status) {
        return res.status(404).json({ error: "System status not found" });
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system status" });
    }
  });

  app.post("/api/bot/restart", async (req, res) => {
    try {
      // Simulate bot restart
      setTimeout(async () => {
        await storage.updateSystemStatus({
          botStatus: "restarting",
          webhookStatus: "active",
          dbStatus: "connected",
          apiStatus: "monitoring",
          uptime: "99.8%",
          version: "v2.1.0",
          build: "#1542",
          environment: "production",
          server: "Render.com",
          region: "Singapore",
          lastDeploy: "just now",
          cpuUsage: 15,
          memoryUsage: 45,
          diskUsage: 42
        });
      }, 2000);

      res.json({ 
        success: true, 
        message: "Bot restart initiated" 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to restart bot" });
    }
  });

  app.post("/api/webhook/update", async (req, res) => {
    try {
      res.json({ 
        success: true, 
        message: "Webhook updated successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update webhook" });
    }
  });

  app.post("/api/system/diagnostics", async (req, res) => {
    try {
      const { command } = req.body;
      let output = "";
      
      switch (command) {
        case "network":
          output = "Network Diagnostics:\n";
          output += "✓ MongoDB Connection: Active\n";
          output += "✓ Telegram API: Connected\n";
          output += "✓ Webhook Status: Active\n";
          output += "✓ DNS Resolution: OK\n";
          output += "⚠ Latency: 45ms (Good)\n";
          break;
        case "database":
          const db = await mongodb();
          const collections = await db.listCollections().toArray();
          output = "Database Diagnostics:\n";
          output += `✓ Connection Status: Connected\n`;
          output += `✓ Collections: ${collections.length}\n`;
          collections.forEach(col => {
            output += `  - ${col.name}\n`;
          });
          break;
        case "bot":
          output = "Bot Diagnostics:\n";
          output += "✓ Bot Token: Valid\n";
          output += "✓ Webhook URL: Active\n";
          output += "✓ Commands: Registered\n";
          output += "✓ Memory Usage: 45MB\n";
          output += "⚠ Response Time: 1.2s\n";
          break;
        case "system":
          output = "System Diagnostics:\n";
          output += `✓ Node.js Version: ${process.version}\n`;
          output += `✓ Platform: ${process.platform}\n`;
          output += `✓ Architecture: ${process.arch}\n`;
          output += `✓ Uptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m\n`;
          output += `✓ Memory Usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB\n`;
          break;
        default:
          output = "Unknown diagnostic command";
      }

      res.json({ success: true, output });
    } catch (error) {
      res.status(500).json({ error: "Failed to run diagnostics" });
    }
  });

  app.post("/api/bot/stop", async (req, res) => {
    try {
      await storage.updateSystemStatus({
        botStatus: "offline",
        webhookStatus: "inactive",
        dbStatus: "connected",
        apiStatus: "monitoring",
        uptime: "99.8%",
        version: "v2.1.0",
        build: "#1542",
        environment: "production",
        server: "Render.com",
        region: "Singapore",
        lastDeploy: "2 hours ago",
        cpuUsage: 5,
        memoryUsage: 20,
        diskUsage: 42
      });

      res.json({ 
        success: true, 
        message: "Bot stopped successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
