// src/types.ts - MIGRATED TO NODE.JS
export interface Contact {
  Email: string;
  FirstName?: string;
  LastName?: string;
  Company?: string;
  Subject?: string;
  [key: string]: any;
}

export interface EmailLog {
  id: string;
  email: string;
  status: "Sent" | "Failed" | "Error";
  message?: string;
  timestamp: string;
  messageId?: string;
  firstName?: string;
  company?: string;
  subject?: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailJob {
  contacts: Contact[];
  htmlContent: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  config: EmailConfig;
  delay: number;
}

export interface SMTPDefaults {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromEmail?: string;
  fromName?: string;
}

export interface BatchConfig {
  batchSize: number;
  emailDelay: number;
  batchDelay: number;
  enabled: boolean;
}

// UPDATED: BatchJob interface with notification support
export interface BatchJob {
  id: string;
  totalContacts: number;
  currentBatch: number;
  totalBatches: number;
  emailsSent: number;
  emailsFailed: number;
  status: 'Running' | 'Paused' | 'Completed' | 'Failed';
  startTime: string;
  config: BatchConfig;
  emailJob: EmailJob;
  nextBatchTime?: string;
  // NEW PROPERTIES:
  notificationSettings?: {
    email: string;
    userId: string;
    configName?: string;
  };
  userId?: string;
  configName?: string;
}

export interface BatchStatus {
  isRunning: boolean;
  currentJob: BatchJob | null;
  totalJobs: number;
  completedJobs: number;
}

export interface ScheduledJob {
  id: string;
  userId: string;  // NEW: Added user ID
  emailJob: EmailJob;
  batchConfig?: BatchConfig;
  scheduledTime: string;
  notifyEmail?: string;
  notifyBrowser?: boolean;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  contactCount: number;
  subject: string;
  useBatch: boolean;
  configName?: string;  // NEW: Added config name
}

export interface NotificationSettings {
  email?: string;
  browser?: boolean;
  userId?: string;
  configName?: string;
}

export interface NotificationConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
}

export interface ProviderLimits {
  dailyLimit: number;
  name: string;
  recommendedBatchSize: number;
  recommendedDelay: number;
}