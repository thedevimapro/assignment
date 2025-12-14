// src/routes/send.ts - MIGRATED TO NODE.JS
import { Hono } from "hono";
import { emailService } from "../services/emailService.js";
import { batchService } from "../services/batchService.js";
import { schedulerService } from "../services/schedulerService.js";
import { notificationService } from "../services/notificationService.js";
import { ProviderDetection } from "../services/providerLimits.js";
import { FileService } from "../services/fileService.js";
import { userDatabase } from "../services/userDatabase.js";
import { requireAuth } from "../middleware/auth.js";
import type {
  EmailJob,
  EmailConfig,
  BatchConfig,
  NotificationConfig,
} from "../types.js";

const app = new Hono();

// Initialize notification service if configured
if (process.env.NOTIFICATION_SMTP_USER) {
  const notificationConfig: NotificationConfig = {
    host: process.env.NOTIFICATION_SMTP_HOST || process.env.SMTP_HOST || "",
    port: parseInt(
      process.env.NOTIFICATION_SMTP_PORT || process.env.SMTP_PORT || "587"
    ),
    secure:
      (process.env.NOTIFICATION_SMTP_SECURE || process.env.SMTP_SECURE) ===
      "true",
    user: process.env.NOTIFICATION_SMTP_USER || "",
    pass: process.env.NOTIFICATION_SMTP_PASS || "",
    fromName:
      process.env.NOTIFICATION_FROM_NAME || "Email Campaign Notifications",
  };

  notificationService.setupGlobalNotificationSender(notificationConfig);
  console.log("📧 Notification service configured");
}

app.post("/send", async (c) => {
  try {
    const user = requireAuth(c);
    console.log(`📧 Send request from user: ${user.email}`);

    const formData = await c.req.formData();

    const configId = formData.get("configId") as string;
    console.log(`🔧 Using config ID: ${configId}`);

    let userConfig = null;
    if (configId) {
      const userConfigs = userDatabase.getUserSMTPConfigs(user.id);
      userConfig = userConfigs.find((config) => config.id === configId);
    }

    if (!userConfig) {
      userConfig = userDatabase.getUserDefaultSMTPConfig(user.id);
    }

    if (!userConfig) {
      return c.json(
        {
          success: false,
          message:
            "No SMTP configuration found. Please add an SMTP configuration first.",
        },
        400
      );
    }

    console.log(
      `✅ Using SMTP config: ${userConfig.name} (${userConfig.host}:${userConfig.port})`
    );

    const smtpHost = userConfig.host;
    const smtpPort = userConfig.port;
    const smtpSecure = !!userConfig.secure;
    const smtpUser = userConfig.user;
    const smtpPass = userConfig.pass;
    const fromEmail = userConfig.from_email;
    const fromName = userConfig.from_name || "";

    const subject = (formData.get("subject") as string) || "";
    const htmlContent = (formData.get("htmlContent") as string) || "";
    const delay = parseInt(formData.get("delay") as string) || 20;

    const useBatch = formData.get("useBatch") === "on";
    const batchSize = parseInt(formData.get("batchSize") as string) || 20;
    const batchDelay = parseInt(formData.get("batchDelay") as string) || 60;
    const emailDelay = parseInt(formData.get("emailDelay") as string) || 45;

    const scheduleEmail = formData.get("scheduleEmail") === "on";
    const scheduledTime = formData.get("scheduledTime") as string;
    const notifyEmail = formData.get("notifyEmail") as string;
    const notifyBrowser = formData.get("notifyBrowser") === "on";

    const excelFile = formData.get("excelFile") as File;
    const htmlTemplateFile = formData.get("htmlTemplate") as File;

    console.log("📋 Email job data:", {
      configName: userConfig.name,
      smtpHost,
      smtpPort,
      smtpSecure,
      fromEmail,
      useBatch,
      batchSize,
      batchDelay,
      emailDelay,
      scheduleEmail,
      scheduledTime,
      notifyEmail,
      notifyBrowser,
      subject: subject ? `"${subject}"` : "empty",
      excelFile: excelFile
        ? `${excelFile.name} (${excelFile.size} bytes)`
        : "none",
    });

    const missingFields = [];
    if (!smtpHost) missingFields.push("SMTP Host");
    if (!smtpUser) missingFields.push("SMTP User");
    if (!smtpPass) missingFields.push("SMTP Password");
    if (!fromEmail) missingFields.push("From Email");
    if (!subject || subject.trim() === "") missingFields.push("Subject");
    if (scheduleEmail && !scheduledTime) missingFields.push("Scheduled Time");

    if (missingFields.length > 0) {
      return c.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        400
      );
    }

    if (!excelFile || excelFile.size === 0) {
      return c.json({ success: false, message: "Contact list file is required (Excel or CSV)" }, 400);
    }

    // Validate file extension
    const fileName = excelFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      return c.json({
        success: false,
        message: "Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file"
      }, 400);
    }

    if (!htmlTemplateFile || htmlTemplateFile.size === 0) {
      if (
        !htmlContent ||
        htmlContent.trim() === "" ||
        htmlContent === "<p><br></p>"
      ) {
        return c.json(
          {
            success: false,
            message:
              "Email content is required (either in editor or upload HTML template)",
          },
          400
        );
      }
    }

    const emailConfig: EmailConfig = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    };

    console.log(
      `🔍 Testing SMTP connection to ${smtpHost}:${smtpPort} (secure: ${smtpSecure})...`
    );

    try {
      const connectionValid = await emailService.testConnection(emailConfig);
      if (!connectionValid) {
        let errorMessage =
          "SMTP connection failed. Please check your settings.";

        if (smtpHost.includes("gmail")) {
          errorMessage = `Gmail SMTP connection failed. Please ensure:
          • You're using an App Password (not your regular Gmail password)
          • 2-Factor Authentication is enabled on your Google account
          • Host: smtp.gmail.com, Port: 465 (SSL) or 587 (TLS)
          • Generate App Password: https://myaccount.google.com/apppasswords`;
        } else if (
          smtpHost.includes("outlook") ||
          smtpHost.includes("hotmail")
        ) {
          errorMessage = `Outlook SMTP connection failed. Please ensure:
          • Host: smtp-mail.outlook.com, Port: 587
          • Use your regular Outlook password
          • Enable "Less secure app access" if needed`;
        }

        return c.json({ success: false, message: errorMessage }, 400);
      }
    } catch (testError) {
      console.error("SMTP test error details:", testError);
      let specificError = "SMTP connection test failed.";

      if (testError instanceof Error) {
        if (
          testError.message.includes("Invalid login") ||
          testError.message.includes("Username and Password not accepted")
        ) {
          if (smtpHost.includes("gmail")) {
            specificError = `❌ Gmail Authentication Failed:
🔧 Quick Fix:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character App Password (not your regular password)
4. SMTP Settings: smtp.gmail.com:465 with SSL enabled`;
          } else {
            specificError = `❌ Authentication Failed: Invalid username or password for ${smtpHost}`;
          }
        } else if (
          testError.message.includes("ECONNREFUSED") ||
          testError.message.includes("ESOCKET")
        ) {
          specificError = `❌ Connection Failed: Cannot connect to ${smtpHost}:${smtpPort}
🔧 Check these settings:
• Gmail: smtp.gmail.com:465 (SSL) or smtp.gmail.com:587 (TLS)
• Outlook: smtp-mail.outlook.com:587 (TLS)
• Yahoo: smtp.mail.yahoo.com:587 (TLS)`;
        } else {
          specificError = `❌ SMTP Error: ${testError.message}`;
        }
      }

      return c.json({ success: false, message: specificError }, 400);
    }

    let contacts = [];
    try {
      console.log("📊 Processing Excel file...");
      const arrayBuffer = await excelFile.arrayBuffer();
      const filename = `${Date.now()}_${excelFile.name}`;
      const filePath = await FileService.saveUploadedFile(
        new Uint8Array(arrayBuffer),
        filename
      );
      const allContacts = await FileService.parseExcelFile(filePath);
      console.log(`📋 Parsed ${allContacts.length} contacts from Excel file`);

      const emailRangeStart = parseInt(formData.get("emailRangeStart") as string) || 0;
      const emailRangeCount = parseInt(formData.get("emailRangeCount") as string) || allContacts.length;

      const endIndex = Math.min(emailRangeStart + emailRangeCount, allContacts.length);
      contacts = allContacts.slice(emailRangeStart, endIndex);

      console.log(`📧 Email range selection: ${emailRangeStart + 1} to ${endIndex} (${contacts.length} contacts selected from ${allContacts.length} total)`);
    } catch (error) {
      console.error("Excel parsing error:", error);
      return c.json(
        {
          success: false,
          message: `Failed to parse Excel file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        400
      );
    }

    const maxContacts = ProviderDetection.calculateMaxContacts(
      smtpHost,
      !!notifyEmail
    );
    if (contacts.length > maxContacts) {
      const provider = ProviderDetection.detectProvider(smtpHost);
      return c.json(
        {
          success: false,
          message: `${
            provider.name
          } limit: Maximum ${maxContacts} contacts allowed${
            notifyEmail ? " (1 reserved for notification)" : ""
          }`,
        },
        400
      );
    }

    let finalHtmlContent = htmlContent;
    if (htmlTemplateFile && htmlTemplateFile.size > 0) {
      try {
        console.log("📄 Processing HTML template file...");
        const arrayBuffer = await htmlTemplateFile.arrayBuffer();
        const filename = `${Date.now()}_${htmlTemplateFile.name}`;
        const filePath = await FileService.saveUploadedFile(
          new Uint8Array(arrayBuffer),
          filename
        );
        finalHtmlContent = await FileService.readHTMLTemplate(filePath);
        console.log("✅ Using HTML template as primary content");
      } catch (error) {
        return c.json(
          {
            success: false,
            message: `Failed to process HTML template: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
          400
        );
      }
    }

    const emailJob: EmailJob = {
      contacts,
      htmlContent: finalHtmlContent,
      subject: subject.trim(),
      fromEmail,
      fromName,
      config: emailConfig,
      delay: useBatch ? emailDelay : delay,
    };

    const batchConfig: BatchConfig | null = useBatch
      ? {
          batchSize,
          emailDelay,
          batchDelay,
          enabled: true,
        }
      : null;

    const notificationSettings = notifyEmail
      ? {
          email: notifyEmail,
          userId: user.id,
          configName: userConfig.name,
        }
      : undefined;

    if (scheduleEmail) {
      const scheduledDate = new Date(scheduledTime);

      console.log(`📅 Received UTC time: ${scheduledTime}`);
      console.log(`⏰ Parsed as: ${scheduledDate.toISOString()}`);

      if (scheduledDate <= new Date()) {
        return c.json(
          {
            success: false,
            message: "Scheduled time must be in the future",
          },
          400
        );
      }

      const jobId = await schedulerService.scheduleJob(
        user.id,
        emailJob,
        batchConfig,
        scheduledDate,
        userConfig.name,
        notifyEmail,
        notifyBrowser
      );

      console.log(
        `📅 Email campaign scheduled: ${jobId} for user ${user.email}`
      );

      return c.json({
        success: true,
        message: `📅 Email campaign scheduled for ${scheduledDate.toLocaleString()}`,
        jobId,
        scheduledTime: scheduledDate.toISOString(),
        contactCount: contacts.length,
        scheduledMode: true,
        batchMode: useBatch,
        configUsed: userConfig.name,
      });
    } else {
      if (useBatch) {
        console.log(
          `⚡ Starting BATCH email job: ${contacts.length} contacts in batches of ${batchSize}`
        );

        const jobId = await batchService.startBatchJob(
          emailJob,
          batchConfig!,
          notificationSettings
        );

        return c.json({
          success: true,
          message: `Batch email job started! Will send ${batchSize} emails every ${batchDelay} minutes.`,
          contactCount: contacts.length,
          jobId,
          batchMode: true,
          batchConfig,
          configUsed: userConfig.name,
        });
      } else {
        console.log(
          `🚀 Starting normal bulk email job: ${contacts.length} contacts`
        );
        emailService.createTransport(emailConfig);

        emailService
          .sendBulkEmails(emailJob, notificationSettings)
          .catch((error) => {
            console.error("Bulk email sending failed:", error);
          });

        return c.json({
          success: true,
          message: `Email sending started for ${contacts.length} contacts`,
          contactCount: contacts.length,
          configUsed: userConfig.name,
        });
      }
    }
  } catch (error) {
    console.error("Send endpoint error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return c.json(
      {
        success: false,
        message: `Server error: ${message}`,
      },
      500
    );
  }
});

// Test notification endpoint
app.post("/test-notification", async (c) => {
  try {
    const user = requireAuth(c);
    const body = await c.req.json();
    const { testEmail } = body;

    if (!testEmail) {
      return c.json({ success: false, message: "Test email required" }, 400);
    }

    const success = await notificationService.sendTestNotification(
      user.id,
      testEmail
    );

    return c.json({
      success,
      message: success
        ? "✅ Test notification sent successfully"
        : "❌ Failed to send test notification",
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return c.json(
      { success: false, message: "Failed to send test notification" },
      500
    );
  }
});

app.post("/provider-info", async (c) => {
  try {
    const formData = await c.req.formData();
    const smtpHost = (formData.get("smtpHost") as string) || "";
    const hasNotification =
      (formData.get("hasNotification") as string) === "true";

    if (!smtpHost) {
      return c.json({ success: false, message: "SMTP host required" }, 400);
    }

    const provider = ProviderDetection.detectProvider(smtpHost);
    const maxContacts = ProviderDetection.calculateMaxContacts(
      smtpHost,
      hasNotification
    );

    return c.json({
      success: true,
      data: {
        provider: provider.name,
        dailyLimit: provider.dailyLimit,
        maxContacts,
        recommendedBatchSize: provider.recommendedBatchSize,
        recommendedDelay: provider.recommendedDelay,
      },
    });
  } catch (error) {
    return c.json(
      { success: false, message: "Failed to detect provider" },
      500
    );
  }
});

app.get("/scheduled-jobs", (c) => {
  const jobs = schedulerService.getScheduledJobs();
  return c.json({ success: true, data: jobs });
});

app.delete("/scheduled-jobs/:id", async (c) => {
  const jobId = c.req.param("id");
  const cancelled = await schedulerService.cancelScheduledJob(jobId);

  if (cancelled) {
    return c.json({ success: true, message: "Scheduled job cancelled" });
  } else {
    return c.json(
      { success: false, message: "Job not found or cannot be cancelled" },
      404
    );
  }
});

app.post("/parse-excel", async (c) => {
  try {
    const formData = await c.req.formData();

    // Get all files from formData (supports multiple files)
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'excelFile' || key.startsWith('excelFile')) {
        if (value instanceof File && value.size > 0) {
          files.push(value);
        }
      }
    }

    if (files.length === 0) {
      return c.json({ success: false, message: "At least one file is required" }, 400);
    }

    let allContacts: any[] = [];
    const processedFiles: string[] = [];

    for (const file of files) {
      // Check file extension
      const fileName = file.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

      if (!isCSV && !isExcel) {
        return c.json({
          success: false,
          message: `Invalid file format: ${file.name}. Please upload Excel (.xlsx, .xls) or CSV (.csv) files only`
        }, 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const filename = `temp_${Date.now()}_${file.name}`;
      const filePath = await FileService.saveUploadedFile(
        new Uint8Array(arrayBuffer),
        filename
      );
      const contacts = await FileService.parseExcelFile(filePath);

      allContacts = allContacts.concat(contacts);
      processedFiles.push(`${file.name} (${contacts.length} contacts)`);
    }

    // Get column names from the first contact
    const columns = allContacts.length > 0 ? Object.keys(allContacts[0]) : [];

    console.log(`📊 Parsed ${files.length} file(s): ${processedFiles.join(', ')}`);
    console.log(`📋 Total contacts: ${allContacts.length}`);

    return c.json({
      success: true,
      contacts: allContacts,
      columns: columns,
      totalCount: allContacts.length,
      filesProcessed: processedFiles,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse file";
    return c.json({ success: false, message }, 500);
  }
});

app.get("/batch-status", (c) => {
  const status = batchService.getBatchStatus();
  return c.json({ success: true, data: status });
});

app.post("/batch-pause", async (c) => {
  await batchService.pauseCurrentJob();
  return c.json({ success: true, message: "Batch job paused" });
});

app.post("/batch-resume", async (c) => {
  await batchService.resumeCurrentJob();
  return c.json({ success: true, message: "Batch job resumed" });
});

app.delete("/batch-cancel", async (c) => {
  await batchService.cancelCurrentJob();
  return c.json({ success: true, message: "Batch job cancelled" });
});

export default app;

