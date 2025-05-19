// dbClient.ts
import { PoolClient } from 'pg';

// const pool = new Pool(); // configure with your DB connection settings
import pool from './db';

export class PgClient {
  private client: PoolClient;

  constructor(client: PoolClient) {
    this.client = client;
  }

  static async create(userId: number): Promise<PgClient> {
    const client = await pool.connect();
    const managedClient = new PgClient(client);

    try {
      await client.query('BEGIN');
      await client.query(`SET app.current_user_id = ${userId}`);
    } catch (err) {
      client.release();
      throw err;
    }

    return managedClient;
  }

  async query(sql: string, params: any[]) {
    return this.client.query(sql, params);
  }

  async commit() {
    try {
      await this.client.query('COMMIT');
    } finally {
      this.client.release();
    }
  }

  async rollback() {
    try {
      await this.client.query('ROLLBACK');
    } finally {
      this.client.release();
    }
  }

  // ✅ Select query without transaction (no user context needed)
  static async selectQuery(sql: string, params?: any[]) {
    const result = await pool.query(sql, params);
    return result;
  }
}