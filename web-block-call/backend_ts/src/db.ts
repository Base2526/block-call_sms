// db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 2000,               // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection before timing out
});

// You can also log the pool status on any significant event
pool.on('connect', () => {
  console.log("pool connect")
});

pool.on('acquire', (client) => {
  console.log('pool acquired');
});

pool.on('remove', (client) => {
  console.log('pool removed');
});

// Export the pool instance
export default pool;
