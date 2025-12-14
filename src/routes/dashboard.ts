// src/routes/dashboard.ts - MIGRATED TO NODE.JS
import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";

// Simple in-memory cache for dashboard state
let dashboardState = {
  lastBatchCheck: 0,
  lastScheduledCheck: 0,
  hasBatchJobs: false,
  hasScheduledJobs: false,
  cacheValidFor: 5000,
};

const app = new Hono();

// Lightweight endpoint to check if polling is needed
app.get("/poll-status", (c) => {
  const user = requireAuth(c);

  try {
    const now = Date.now();
    let hasActiveBatch = false;
    let hasScheduledJobs = false;
    let hasRunningScheduledJobs = false;

    if (now - dashboardState.lastBatchCheck < dashboardState.cacheValidFor) {
      hasActiveBatch = dashboardState.hasBatchJobs;
    } else {
      try {
        const { batchService } = require("../services/batchService.js");
        const batchStatus = batchService.getBatchStatus();
        hasActiveBatch = batchStatus.isRunning;
        dashboardState.hasBatchJobs = hasActiveBatch;
        dashboardState.lastBatchCheck = now;
      } catch (error: any) {
        console.warn("Batch service not available:", error.message);
        hasActiveBatch = false;
      }
    }

    if (
      now - dashboardState.lastScheduledCheck <
      dashboardState.cacheValidFor
    ) {
      hasScheduledJobs = dashboardState.hasScheduledJobs;
    } else {
      try {
        const { schedulerService } = require("../services/schedulerService.js");
        const scheduledJobs = schedulerService.getScheduledJobs();
        hasScheduledJobs = scheduledJobs && scheduledJobs.length > 0;
        hasRunningScheduledJobs =
          scheduledJobs &&
          scheduledJobs.some((job: any) => job.status === "running");
        dashboardState.hasScheduledJobs = hasScheduledJobs;
        dashboardState.lastScheduledCheck = now;
      } catch (error: any) {
        console.warn("Scheduler service not available:", error.message);
        hasScheduledJobs = false;
      }
    }

    let pollNeeded = false;
    let pollInterval = 30000;

    if (hasActiveBatch) {
      pollNeeded = true;
      pollInterval = 3000;
    } else if (hasRunningScheduledJobs) {
      pollNeeded = true;
      pollInterval = 10000;
    } else if (hasScheduledJobs) {
      pollNeeded = true;
      pollInterval = 30000;
    }

    return c.json({
      success: true,
      data: {
        pollNeeded,
        pollInterval,
        hasActiveBatch,
        hasScheduledJobs,
        hasRunningScheduledJobs,
        activeBatchCount: hasActiveBatch ? 1 : 0,
        scheduledJobCount: hasScheduledJobs ? 1 : 0,
        lastUpdated: new Date().toISOString(),
        cached: true,
      },
    });
  } catch (error) {
    console.error("Poll status error:", error);
    return c.json({
      success: true,
      data: {
        pollNeeded: false,
        pollInterval: 30000,
        hasActiveBatch: false,
        hasScheduledJobs: false,
        hasRunningScheduledJobs: false,
        activeBatchCount: 0,
        scheduledJobCount: 0,
        lastUpdated: new Date().toISOString(),
        error: "Service unavailable",
      },
    });
  }
});

// Optimized dashboard data endpoint
app.get("/data", (c) => {
  const user = requireAuth(c);

  try {
    let batchStatus = null;
    let scheduledJobs = null;

    if (dashboardState.hasBatchJobs) {
      try {
        const { batchService } = require("../services/batchService.js");
        batchStatus = batchService.getBatchStatus();
      } catch (error: any) {
        console.warn("Batch service unavailable:", error.message);
      }
    }

    if (dashboardState.hasScheduledJobs) {
      try {
        const { schedulerService } = require("../services/schedulerService.js");
        const allJobs = schedulerService.getScheduledJobs();
        scheduledJobs = allJobs
          .filter(
            (job: any) => job.status === "scheduled" || job.status === "running"
          )
          .slice(0, 5);
      } catch (error: any) {
        console.warn("Scheduler service unavailable:", error.message);
      }
    }

    return c.json({
      success: true,
      data: {
        batch: batchStatus,
        scheduledJobs: scheduledJobs || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
        data: {
          batch: null,
          scheduledJobs: [],
          timestamp: new Date().toISOString(),
        },
      },
      500
    );
  }
});

export default app;

