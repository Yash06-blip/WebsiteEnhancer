import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

// Replace with your MySQL credentials
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306, // Default MySQL port
  user: 'root',
  password: '8519273',
  database: 'coal_mine_management'
});

export const db = drizzle(pool, { schema, mode: 'default' });