// src/services/userDatabase.ts - MIGRATED TO NODE.JS with better-sqlite3
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { hash, verify } from "argon2";
import { createHmac, randomBytes } from "crypto";

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface UserSMTPConfig {
  id: string;
  user_id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from_email: string;
  from_name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

class UserDatabase {
  private db: Database.Database;
  private sessionSecret: string;

  constructor() {
    const dbPath = "./data/users.db";
    const dbDir = dirname(dbPath);

    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
      console.log("📁 Created data directory for user database");
    }

    this.db = new Database(dbPath);
    this.initDatabase();

    this.sessionSecret = process.env.SESSION_SECRET || this.generateFallbackSecret();

    if (!process.env.SESSION_SECRET) {
      console.warn("⚠️  No SESSION_SECRET found in .env file");
      console.warn("🔧 For production security, add SESSION_SECRET to your .env:");
      console.warn("   SESSION_SECRET=" + randomBytes(64).toString('hex'));
      console.warn("🔄 Using temporary secret for now...");
    } else {
      console.log("🔒 Session secret loaded from environment");
    }
  }

  private generateFallbackSecret(): string {
    const fallbackSecret = randomBytes(64).toString('hex');
    console.warn("⚠️  Generated temporary session secret - sessions will be invalidated on restart");
    return fallbackSecret;
  }

  private initDatabase() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // User SMTP configs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_smtp_configs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        secure INTEGER NOT NULL,
        user TEXT NOT NULL,
        pass TEXT NOT NULL,
        from_email TEXT NOT NULL,
        from_name TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    this.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)`
    );
    this.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)`
    );
    this.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_smtp_configs_user_id ON user_smtp_configs(user_id)`
    );

    console.log("✅ User database initialized with better-sqlite3");
  }

  private generateSecureToken(userId: string): string {
    try {
      const randomPart = randomBytes(32).toString('hex');
      const timestamp = Date.now().toString();
      const payload = `${userId}:${timestamp}:${randomPart}`;
      const signature = createHmac('sha256', this.sessionSecret)
        .update(payload)
        .digest('hex');

      return `${payload}:${signature}`;
    } catch (error) {
      console.error("❌ Error generating secure token:", error);
      return `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  private verifyToken(token: string): { userId: string; timestamp: number } | null {
    try {
      const parts = token.split(':');

      if (parts.length === 4) {
        const [userId, timestamp, randomPart, signature] = parts;
        const payload = `${userId}:${timestamp}:${randomPart}`;

        const expectedSignature = createHmac('sha256', this.sessionSecret)
          .update(payload)
          .digest('hex');

        if (signature !== expectedSignature) {
          console.warn("🚨 Invalid token signature detected for user:", userId);
          return null;
        }

        return { userId, timestamp: parseInt(timestamp) };

      } else if (parts.length === 1 && token.includes('_')) {
        const oldParts = token.split('_');
        if (oldParts.length >= 3) {
          const userId = oldParts[0];
          const timestamp = parseInt(oldParts[1]);
          console.warn("⚠️  Using legacy token format for user:", userId);
          return { userId, timestamp };
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Token verification error:", error);
      return null;
    }
  }

  async createUser(
    email: string,
    name: string,
    password: string
  ): Promise<string> {
    const userId = `user_${Date.now()}`;
    const passwordHash = await hash(password);

    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (id, email, name, password_hash)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(userId, email.toLowerCase(), name, passwordHash);

      console.log(`👤 User created: ${email}`);
      return userId;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        throw new Error("Email already exists");
      }
      throw error;
    }
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE email = ? AND is_active = 1
    `);
    const user = stmt.get(email.toLowerCase()) as User | undefined;

    if (!user) {
      return null;
    }

    const isValid = await verify(user.password_hash, password);
    if (!isValid) {
      return null;
    }

    // Update last login
    const updateStmt = this.db.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateStmt.run(user.id);

    return user;
  }

  getUserById(userId: string): User | null {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE id = ? AND is_active = 1
    `);
    return stmt.get(userId) as User | null;
  }

  async createSession(userId: string): Promise<string> {
    const sessionId = `sess_${Date.now()}`;
    const token = this.generateSecureToken(userId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Clean old sessions for this user
    const cleanStmt = this.db.prepare(`
      DELETE FROM user_sessions WHERE user_id = ? AND expires_at < CURRENT_TIMESTAMP
    `);
    cleanStmt.run(userId);

    const insertStmt = this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(sessionId, userId, token, expiresAt);

    return token;
  }

  validateSession(token: string): User | null {
    try {
      const tokenData = this.verifyToken(token);
      if (!tokenData) {
        return null;
      }

      const stmt = this.db.prepare(`
        SELECT s.*, u.* FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1
      `);
      const session = stmt.get(token) as any;

      if (!session) {
        return null;
      }

      return {
        id: session.user_id,
        email: session.email,
        name: session.name,
        password_hash: session.password_hash,
        created_at: session.created_at,
        last_login: session.last_login,
        is_active: session.is_active,
      };
    } catch (error) {
      console.error("❌ Session validation error:", error);
      return null;
    }
  }

  deleteSession(token: string): void {
    const stmt = this.db.prepare(`DELETE FROM user_sessions WHERE token = ?`);
    stmt.run(token);
  }

  async createSMTPConfig(
    userId: string,
    config: Omit<UserSMTPConfig, "id" | "user_id" | "created_at" | "updated_at">
  ): Promise<string> {
    const configId = `smtp_${Date.now()}`;

    if (config.is_default) {
      const resetStmt = this.db.prepare(`
        UPDATE user_smtp_configs SET is_default = 0 WHERE user_id = ?
      `);
      resetStmt.run(userId);
    }

    const insertStmt = this.db.prepare(`
      INSERT INTO user_smtp_configs 
      (id, user_id, name, host, port, secure, user, pass, from_email, from_name, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      configId,
      userId,
      config.name,
      config.host,
      config.port,
      config.secure ? 1 : 0,
      config.user,
      config.pass,
      config.from_email,
      config.from_name || "",
      config.is_default ? 1 : 0
    );

    return configId;
  }

  getUserSMTPConfigs(userId: string): UserSMTPConfig[] {
    const stmt = this.db.prepare(`
      SELECT * FROM user_smtp_configs 
      WHERE user_id = ? 
      ORDER BY is_default DESC, created_at DESC
    `);
    return stmt.all(userId) as UserSMTPConfig[];
  }

  getUserDefaultSMTPConfig(userId: string): UserSMTPConfig | null {
    const stmt = this.db.prepare(`
      SELECT * FROM user_smtp_configs 
      WHERE user_id = ? AND is_default = 1
    `);
    return stmt.get(userId) as UserSMTPConfig | null;
  }

  updateSMTPConfig(
    configId: string,
    userId: string,
    updates: Partial<UserSMTPConfig>
  ): boolean {
    const allowedFields = [
      "name",
      "host",
      "port",
      "secure",
      "user",
      "pass",
      "from_email",
      "from_name",
      "is_default",
    ];
    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      return false;
    }

    if (updates.is_default) {
      const resetStmt = this.db.prepare(`
        UPDATE user_smtp_configs SET is_default = 0 WHERE user_id = ? AND id != ?
      `);
      resetStmt.run(userId, configId);
    }

    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const values = updateFields.map((field) => {
      if (field === "secure" || field === "is_default") {
        return updates[field as keyof UserSMTPConfig] ? 1 : 0;
      }
      return updates[field as keyof UserSMTPConfig];
    });

    const stmt = this.db.prepare(`
      UPDATE user_smtp_configs 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(...values, configId, userId);

    return result.changes > 0;
  }

  deleteSMTPConfig(configId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM user_smtp_configs WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(configId, userId);

    return result.changes > 0;
  }

  cleanExpiredSessions(): void {
    const stmt = this.db.prepare(`
      DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP
    `);
    const result = stmt.run();

    if (result.changes > 0) {
      console.log(`🧹 Cleaned ${result.changes} expired sessions`);
    }
  }

  async upgradeUserTokens(userId: string): Promise<void> {
    try {
      const stmt = this.db.prepare(`SELECT * FROM user_sessions WHERE user_id = ? AND token LIKE '%_%_%'`);
      const oldSessions = stmt.all(userId) as UserSession[];

      for (const session of oldSessions) {
        const newToken = this.generateSecureToken(userId);
        const updateStmt = this.db.prepare(`UPDATE user_sessions SET token = ? WHERE id = ?`);
        updateStmt.run(newToken, session.id);
      }

      if (oldSessions.length > 0) {
        console.log(`🔄 Upgraded ${oldSessions.length} tokens for user ${userId}`);
      }
    } catch (error) {
      console.error("❌ Error upgrading tokens:", error);
    }
  }
}

export const userDatabase = new UserDatabase();

// Clean expired sessions every hour
setInterval(() => {
  userDatabase.cleanExpiredSessions();
}, 60 * 60 * 1000);

