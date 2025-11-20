require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  options: '-c search_path=chit,public',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    await pool.query('CREATE SCHEMA IF NOT EXISTS chit');
    console.log('Schema "chit" ensured.');

    // Members Table
    await pool.query(`CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Chits Table
    await pool.query(`CREATE TABLE IF NOT EXISTS chits (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      start_date DATE,
      duration_months INTEGER NOT NULL,
      commission_percent REAL DEFAULT 5.0,
      status TEXT DEFAULT 'active'
    )`);

    // Chit Members (Junction Table)
    await pool.query(`CREATE TABLE IF NOT EXISTS chit_members (
      chit_id INTEGER REFERENCES chits(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      PRIMARY KEY (chit_id, member_id)
    )`);

    // Chit Cycles (Monthly Records)
    await pool.query(`CREATE TABLE IF NOT EXISTS chit_cycles (
      id SERIAL PRIMARY KEY,
      chit_id INTEGER REFERENCES chits(id) ON DELETE CASCADE,
      month_number INTEGER NOT NULL,
      month_year TEXT,
      bid_amount INTEGER DEFAULT 0,
      winner_member_id INTEGER REFERENCES members(id)
    )`);

    // Cycle Payments
    await pool.query(`CREATE TABLE IF NOT EXISTS cycle_payments (
      id SERIAL PRIMARY KEY,
      cycle_id INTEGER REFERENCES chit_cycles(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending',
      paid_date TIMESTAMP,
      UNIQUE(cycle_id, member_id)
    )`);

    console.log('PostgreSQL Database Initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDb();

module.exports = pool;
