import Transport from 'winston-transport';
import { Pool } from 'pg';

interface PostgresTransportOptions extends Transport.TransportStreamOptions {
  pool: Pool;
}

class PostgresTransport extends Transport {
  private pool: Pool;

  constructor(opts: PostgresTransportOptions) {
    super(opts);
    this.pool = opts.pool;
  }

  async log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { timestamp, level, message, stack } = info;

    // Convert the stack to an object (if it's available)
    const stackObject = stack ? { message: stack.message, stack: stack.stack } : null;

    try {
      await this.pool.query(
        `INSERT INTO logs (created_at, level, message, stack) VALUES ($1, $2, $3, $4)`,
        [timestamp || new Date(), level, message, stackObject || null]
      );
    } catch (error) {
      console.error('Failed to write log to PostgreSQL', error);
    }

    callback();
  }
}

export default PostgresTransport;
