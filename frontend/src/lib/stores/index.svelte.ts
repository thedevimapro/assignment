import { api, type User, type SMTPConfig, type EmailLog, type EmailStats, type ScheduledJob, type BatchStatus } from '$lib/api/client';

class AuthStore {
  user = $state<User | null>(null);
  isLoading = $state(true);
  isAuthenticated = $derived(!!this.user);

  async checkAuth() {
    this.isLoading = true;
    try {
      const res = await api.getUserInfo();
      this.user = res.success && res.user ? res.user : null;
    } catch { this.user = null; }
    finally { this.isLoading = false; }
  }

  async login(email: string, password: string) {
    const res = await api.login(email, password);
    if (res.success && res.user) this.user = res.user;
    return res;
  }

  async register(email: string, name: string, password: string) {
    const res = await api.register(email, name, password);
    if (res.success && res.user) this.user = res.user;
    return res;
  }

  async logout() { await api.logout(); this.user = null; }
}

export const authStore = new AuthStore();

class ConfigStore {
  configs = $state<SMTPConfig[]>([]);
  selectedConfigId = $state<string | null>(null);
  isLoading = $state(false);
  selectedConfig = $derived(this.configs.find(c => c.id === this.selectedConfigId) || null);

  async loadConfigs() {
    this.isLoading = true;
    try {
      const res = await api.getSMTPConfigs();
      if (res.success && res.userConfigs) {
        this.configs = res.userConfigs;
        const def = this.configs.find(c => c.isDefault);
        if (def && !this.selectedConfigId) this.selectedConfigId = def.id;
      }
    } finally { this.isLoading = false; }
  }

  async createConfig(config: Omit<SMTPConfig, 'id' | 'createdAt'>) {
    const res = await api.createSMTPConfig(config);
    if (res.success) await this.loadConfigs();
    return res;
  }

  async updateConfig(configId: string, config: Partial<SMTPConfig>) {
    const res = await api.updateSMTPConfig(configId, config);
    if (res.success) await this.loadConfigs();
    return res;
  }

  async deleteConfig(configId: string) {
    const res = await api.deleteSMTPConfig(configId);
    if (res.success) {
      if (this.selectedConfigId === configId) this.selectedConfigId = null;
      await this.loadConfigs();
    }
    return res;
  }

  async setDefault(configId: string) {
    const res = await api.setDefaultSMTPConfig(configId);
    if (res.success) await this.loadConfigs();
    return res;
  }

  async testConnection(config: { host: string; port: number; secure: boolean; user: string; pass: string }) {
    return await api.testSMTPConnection(config);
  }

  selectConfig(configId: string) { this.selectedConfigId = configId; }
}

export const configStore = new ConfigStore();

class ReportStore {
  logs = $state<EmailLog[]>([]);
  stats = $state<EmailStats>({ total: 0, sent: 0, failed: 0, pending: 0 });
  isLoading = $state(false);

  async loadReport() {
    this.isLoading = true;
    try {
      const res = await api.getReport();
      if (res.success && res.data) {
        this.logs = res.data.logs || [];
        this.stats = res.data.stats || { total: 0, sent: 0, failed: 0, pending: 0 };
      }
    } finally { this.isLoading = false; }
  }

  async clearLogs() {
    const res = await api.clearLogs();
    if (res.success) { this.logs = []; this.stats = { total: 0, sent: 0, failed: 0, pending: 0 }; }
    return res;
  }

  async exportCSV() {
    const blob = await api.exportReportCSV();
    this.download(blob, 'email-logs.csv');
  }

  async exportJSON() {
    const blob = await api.exportReportJSON();
    this.download(blob, 'email-logs.json');
  }

  private download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: name }).click();
    URL.revokeObjectURL(url);
  }
}

export const reportStore = new ReportStore();

class DashboardStore {
  batchStatus = $state<BatchStatus | null>(null);
  scheduledJobs = $state<ScheduledJob[]>([]);
  pollInterval = $state(30000);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  hasActiveBatch = $derived(this.batchStatus?.isRunning ?? false);
  hasScheduledJobs = $derived(this.scheduledJobs.length > 0);

  async checkPollStatus() {
    try {
      const res = await api.getPollStatus();
      if (res.success && res.data) {
        this.pollInterval = res.data.pollInterval;
        if (res.data.hasActiveBatch) await this.loadBatchStatus();
        if (res.data.hasScheduledJobs) await this.loadScheduledJobs();
      }
    } catch {}
  }

  async loadBatchStatus() {
    try {
      const res = await api.getBatchStatus();
      if (res.success && res.data) this.batchStatus = res.data;
    } catch {}
  }

  async loadScheduledJobs() {
    try {
      const res = await api.getScheduledJobs();
      if (res.success && res.data) this.scheduledJobs = res.data;
    } catch {}
  }

  async cancelJob(jobId: string) {
    const res = await api.cancelScheduledJob(jobId);
    if (res.success) await this.loadScheduledJobs();
    return res;
  }

  startPolling() {
    if (this.pollTimer) return;
    this.checkPollStatus();
    this.pollTimer = setInterval(() => this.checkPollStatus(), this.pollInterval);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}

export const dashboardStore = new DashboardStore();

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

class ToastStore {
  toasts = $state<Toast[]>([]);

  add(type: ToastType, message: string, duration: number = 5000) {
    const id = crypto.randomUUID();
    this.toasts = [...this.toasts, { id, type, message }];
    if (duration > 0) setTimeout(() => this.remove(id), duration);
    return id;
  }

  remove(id: string) { this.toasts = this.toasts.filter(t => t.id !== id); }
  success(message: string, duration?: number) { return this.add('success', message, duration); }
  error(message: string, duration?: number) { return this.add('error', message, duration); }
}

export const toastStore = new ToastStore();

