export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SMTPConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass?: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  error?: string;
}

export interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export interface ScheduledJob {
  id: string;
  subject: string;
  scheduledTime: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  recipientCount: number;
}

export interface BatchStatus {
  isRunning: boolean;
  total: number;
  sent: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
}

export interface Contact {
  Email: string;
  FirstName?: string;
  LastName?: string;
  Company?: string;
  [key: string]: string | undefined;
}

