import type { User, SMTPConfig, EmailLog, EmailStats, ScheduledJob, BatchStatus } from '$lib/types';

export type { User, SMTPConfig, EmailLog, EmailStats, ScheduledJob, BatchStatus };

const API_BASE = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
}

interface DashboardPollData {
  pollInterval: number;
  hasActiveBatch: boolean;
  hasScheduledJobs: boolean;
}

class ApiClient {
  private baseUrl = API_BASE;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok && res.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/auth/')) {
      window.location.href = '/login';
    }
    return res.json();
  }

  async login(email: string, password: string) {
    return this.request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  async register(email: string, name: string, password: string) {
    return this.request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, name, password }) });
  }

  async logout() { return this.request('/auth/logout', { method: 'POST' }); }

  async getUserInfo() { return this.request<{ user: User }>('/user/info'); }

  async getSMTPConfigs() {
    const res = await fetch(`${this.baseUrl}/config/smtp`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json() as Promise<{
      success: boolean;
      userConfigs: SMTPConfig[];
      hasConfig: boolean;
      data?: any;
    }>;
  }

  async createSMTPConfig(config: Omit<SMTPConfig, 'id' | 'createdAt'>) {
    return this.request<{ configId: string }>('/config/smtp', { method: 'POST', body: JSON.stringify(config) });
  }

  async updateSMTPConfig(configId: string, config: Partial<SMTPConfig>) {
    return this.request(`/config/smtp/${configId}`, { method: 'PUT', body: JSON.stringify(config) });
  }

  async deleteSMTPConfig(configId: string) {
    return this.request(`/config/smtp/${configId}`, { method: 'DELETE' });
  }

  async testSMTPConnection(config: { host: string; port: number; secure: boolean; user: string; pass: string }) {
    return this.request<{ message: string }>('/config/smtp/test', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async setDefaultSMTPConfig(configId: string) {
    return this.request(`/config/smtp/${configId}/default`, { method: 'POST' });
  }

  async sendEmail(formData: FormData) {
    const res = await fetch(`${this.baseUrl}/send`, { method: 'POST', credentials: 'include', body: formData });
    return res.json();
  }

  async parseExcel(formData: FormData) {
    const res = await fetch(`${this.baseUrl}/parse-excel`, { method: 'POST', credentials: 'include', body: formData });
    return res.json();
  }

  async getReport() { return this.request<{ logs: EmailLog[]; stats: EmailStats }>('/report'); }

  async exportReportCSV() {
    const res = await fetch(`${this.baseUrl}/report/export/csv`, { credentials: 'include' });
    return res.blob();
  }

  async exportReportJSON() {
    const res = await fetch(`${this.baseUrl}/report/export/json`, { credentials: 'include' });
    return res.blob();
  }

  async clearLogs() { return this.request('/report/clear', { method: 'DELETE' }); }

  async getPollStatus() { return this.request<DashboardPollData>('/dashboard/poll-status'); }

  async getBatchStatus() { return this.request<BatchStatus>('/dashboard/batch-status'); }

  async getScheduledJobs() { return this.request<ScheduledJob[]>('/dashboard/scheduled-jobs'); }

  async cancelScheduledJob(jobId: string) {
    return this.request(`/dashboard/scheduled-jobs/${jobId}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

