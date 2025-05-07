import winston, { format, transports } from 'winston';
import { Pool } from 'pg';
import PostgresTransport from './PostgresTransport'; // import custom transport

import pool from '../db';

// Setup PostgreSQL pool
// const pool = new Pool({
//   user: 'postgres',
//   host: 'postgres', // Docker service name if running in docker-compose, otherwise 'localhost'
//   database: 'exampledb',
//   password: 'postgres',
//   port: 5432,
// });

// Define the log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const dbFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: 'info', 
  format: dbFormat, // for general purpose
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new PostgresTransport({ pool }), // <- Add Postgres transport here
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' })
  ]
});

export default logger;