// src/services/batchService.ts - MIGRATED TO NODE.JS
import { emailService } from "./emailService.js";
import { logService } from "./logService.js";
import { FileService } from "./fileService.js";
import type {
  BatchJob,
  BatchConfig,
  EmailJob,
  Contact,
  BatchStatus,
} from "../types.js";

class BatchService {
  private currentJob: BatchJob | null = null;
  private isRunning = false;
  private timeoutId: NodeJS.Timeout | null = null;
  private totalJobs = 0;
  private completedJobs = 0;

  async startBatchJob(
    emailJob: EmailJob,
    batchConfig: BatchConfig,
    notificationSettings?: {
      email: string;
      userId: string;
      configName?: string;
    }
  ): Promise<string> {
    if (this.isRunning) {
      throw new Error("A batch job is already running");
    }

    const jobId = `batch_${Date.now()}`;
    const totalBatches = Math.ceil(
      emailJob.contacts.length / batchConfig.batchSize
    );

    this.currentJob = {
      id: jobId,
      totalContacts: emailJob.contacts.length,
      currentBatch: 0,
      totalBatches,
      emailsSent: 0,
      emailsFailed: 0,
      status: "Running",
      startTime: new Date().toISOString(),
      config: batchConfig,
      emailJob,
      notificationSettings,
      userId: notificationSettings?.userId,
      configName: notificationSettings?.configName
    };

    this.isRunning = true;
    this.totalJobs++;

    console.log(`🚀 Starting batch job ${jobId} for user ${notificationSettings?.userId || 'unknown'}:`);
    console.log(
      `   📊 ${emailJob.contacts.length} contacts → ${totalBatches} batches of ${batchConfig.batchSize}`
    );
    console.log(
      `   ⏱️ ${batchConfig.emailDelay}s between emails, ${batchConfig.batchDelay}min between batches`
    );

    emailService.createTransport(emailJob.config);
    this.processNextBatch();

    return jobId;
  }

  async pauseCurrentJob(): Promise<void> {
    if (this.currentJob && this.isRunning) {
      this.currentJob.status = "Paused";
      this.isRunning = false;

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      console.log(`⏸️ Batch job ${this.currentJob.id} paused`);
    }
  }

  async resumeCurrentJob(): Promise<void> {
    if (this.currentJob && this.currentJob.status === "Paused") {
      this.currentJob.status = "Running";
      this.isRunning = true;

      console.log(`▶️ Batch job ${this.currentJob.id} resumed`);
      this.processNextBatch();
    }
  }

  async cancelCurrentJob(): Promise<void> {
    if (this.currentJob) {
      this.currentJob.status = "Failed";
      this.isRunning = false;

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      console.log(`❌ Batch job ${this.currentJob.id} cancelled`);
      this.completedJobs++;
      this.currentJob = null;
    }
  }

  getBatchStatus(): BatchStatus {
    return {
      isRunning: this.isRunning,
      currentJob: this.currentJob,
      totalJobs: this.totalJobs,
      completedJobs: this.completedJobs,
    };
  }

  private async processNextBatch(): Promise<void> {
    if (!this.currentJob || !this.isRunning) {
      return;
    }

    const job = this.currentJob;
    const { contacts } = job.emailJob;
    const { batchSize } = job.config;

    if (job.currentBatch >= job.totalBatches) {
      await this.completeBatchJob();
      return;
    }

    const startIndex = job.currentBatch * batchSize;
    const endIndex = Math.min(startIndex + batchSize, contacts.length);
    const batchContacts = contacts.slice(startIndex, endIndex);

    job.currentBatch++;

    console.log(
      `📦 Processing batch ${job.currentBatch}/${job.totalBatches} (${batchContacts.length} contacts)`
    );

    try {
      await this.processBatch(batchContacts, job);

      if (job.currentBatch < job.totalBatches && this.isRunning) {
        await this.scheduleNextBatch(job);
      } else {
        await this.completeBatchJob();
      }
    } catch (error) {
      console.error(`❌ Batch ${job.currentBatch} failed:`, error);
      job.status = "Failed";
      this.isRunning = false;
      this.completedJobs++;
    }
  }

  private async processBatch(
    contacts: Contact[],
    job: BatchJob
  ): Promise<void> {
    const { emailJob, config } = job;

    for (let i = 0; i < contacts.length; i++) {
      if (!this.isRunning) {
        break;
      }

      const contact = contacts[i];

      try {
        const personalizedContent = FileService.replacePlaceholders(
          emailJob.htmlContent,
          contact
        );
        const personalizedSubject = FileService.replacePlaceholders(
          emailJob.subject,
          contact
        );

        const mailOptions = {
          from: `${emailJob.fromName} <${emailJob.fromEmail}>`,
          to: contact.Email,
          subject: personalizedSubject,
          html: personalizedContent,
        };

        const info = await emailService.sendSingleEmail(mailOptions);

        logService.addLog({
          id: `batch_${job.id}_${Date.now()}_${i}`,
          email: contact.Email,
          status: "Sent",
          timestamp: new Date().toISOString(),
          messageId: info.messageId,
          firstName: contact.FirstName,
          company: contact.Company,
          subject: personalizedSubject,
        });

        job.emailsSent++;
        console.log(
          `✅ Email sent to ${contact.Email} (${job.emailsSent}/${job.totalContacts})`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        logService.addLog({
          id: `batch_${job.id}_${Date.now()}_${i}`,
          email: contact.Email,
          status: "Failed",
          message: errorMessage,
          timestamp: new Date().toISOString(),
          firstName: contact.FirstName,
          company: contact.Company,
          subject: emailJob.subject,
        });

        job.emailsFailed++;
        console.error(
          `❌ Failed to send email to ${contact.Email}:`,
          errorMessage
        );
      }

      if (i < contacts.length - 1 && this.isRunning) {
        const delay = config.emailDelay * 1000;
        console.log(`⏱️ Waiting ${config.emailDelay}s before next email...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private async scheduleNextBatch(job: BatchJob): Promise<void> {
    const delayMs = job.config.batchDelay * 60 * 1000;
    const nextBatchTime = new Date(Date.now() + delayMs);

    job.nextBatchTime = nextBatchTime.toISOString();

    console.log(
      `⏳ Next batch scheduled for ${nextBatchTime.toLocaleString()} (${
        job.config.batchDelay
      } minutes)`
    );

    this.timeoutId = setTimeout(() => {
      if (this.isRunning && this.currentJob) {
        this.processNextBatch();
      }
    }, delayMs);
  }

  private async completeBatchJob(): Promise<void> {
    if (this.currentJob) {
      this.currentJob.status = "Completed";
      this.currentJob.nextBatchTime = undefined;
      this.isRunning = false;
      this.completedJobs++;

      console.log(`🎉 Batch job ${this.currentJob.id} completed!`);
      console.log(
        `📊 Results: ${this.currentJob.emailsSent} sent, ${this.currentJob.emailsFailed} failed`
      );

      if (this.currentJob.notificationSettings?.email) {
        await this.sendBatchCompletionNotification();
      }

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      setTimeout(() => {
        this.currentJob = null;
      }, 30000);
    }
  }

  private async sendBatchCompletionNotification(): Promise<void> {
    if (!this.currentJob?.notificationSettings?.email) return;

    try {
      const { notificationService } = await import('./notificationService.js');

      const jobStats = {
        sent: this.currentJob.emailsSent,
        failed: this.currentJob.emailsFailed,
        total: this.currentJob.totalContacts,
        errors: 0
      };

      const jobDetails = {
        id: this.currentJob.id,
        subject: this.currentJob.emailJob.subject,
        startTime: this.currentJob.startTime,
        endTime: new Date().toISOString(),
        configUsed: this.currentJob.configName || 'Batch Configuration',
        batchMode: true
      };

      console.log(`📧 Sending batch completion notification to ${this.currentJob.notificationSettings.email} for user ${this.currentJob.userId}`);

      const success = await notificationService.sendJobCompletionNotification(
        this.currentJob.userId!,
        this.currentJob.notificationSettings.email,
        jobStats,
        jobDetails,
        jobDetails.configUsed
      );

      if (success) {
        console.log('✅ Batch completion notification sent successfully');
      } else {
        console.error('❌ Failed to send batch completion notification');
      }
    } catch (error) {
      console.error('❌ Failed to send batch completion notification:', error);
    }
  }
}

export const batchService = new BatchService();

