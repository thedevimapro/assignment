// src/routes/report.ts - MIGRATED TO NODE.JS
import { Hono } from "hono";
import { logService } from "../services/logService.js";

const app = new Hono();

// Get email logs and statistics
app.get("/report", (c) => {
  const logs = logService.getLogs();
  const stats = logService.getStats();

  return c.json({
    success: true,
    data: {
      logs,
      stats,
    },
  });
});

// Export logs as CSV
app.get("/report/export/csv", (c) => {
  const csv = logService.getLogsAsCSV();

  c.header("Content-Type", "text/csv");
  c.header("Content-Disposition", 'attachment; filename="email-logs.csv"');

  return c.text(csv);
});

// Export logs as JSON
app.get("/report/export/json", (c) => {
  const json = logService.getLogsAsJSON();

  c.header("Content-Type", "application/json");
  c.header("Content-Disposition", 'attachment; filename="email-logs.json"');

  return c.text(json);
});

// Clear all logs
app.delete("/report/clear", (c) => {
  logService.clearLogs();
  return c.json({ success: true, message: "Logs cleared successfully" });
});

export default app;

