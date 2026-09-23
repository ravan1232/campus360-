const mysql = require('mysql2/promise');
const mockDatabase = require('../utils/mockData');

let pool = null;
let useFallback = process.env.ENABLE_AUTO_FALLBACK !== 'false';
let isConnectedToMySQL = false;

const initDb = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'campus360_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnectedToMySQL = true;
    console.log(`[DB] Successfully connected to MySQL database: ${process.env.DB_NAME || 'campus360_db'}`);
  } catch (error) {
    if (useFallback) {
      console.warn(`[DB] MySQL server not reachable (${error.message}). Active mode: Seamless In-Memory Mock Store.`);
      isConnectedToMySQL = false;
    } else {
      console.error('[DB] Fatal MySQL connection failure:', error.message);
    }
  }
};

// Unified query wrapper
const query = async (sql, params = []) => {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('[DB] MySQL query execution error:', err.message);
      throw err;
    }
  }
  return null;
};

module.exports = {
  initDb,
  query,
  isMySQLConnected: () => isConnectedToMySQL,
  mockDatabase
};
