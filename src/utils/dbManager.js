// src/utils/dbManager.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';


/**
 * 初始化数据库并创建表（如果表不存在）
 * @param {string} dbPath 数据库文件路径
 * @returns {Database} 返回数据库实例
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'datadb', 'notes.db');

export function initDB(itemname) {
  let db;
  const safeItemName = itemname.replace(/-/g, '_');
  try {
    db = new Database(DB_PATH);
    // 创建表（如果表不存在）
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${safeItemName}_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo TEXT,
        user TEXT,
        date TEXT NOT NULL,
        note TEXT,
        UNIQUE(user, date)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS ${safeItemName}_daily_checkin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT CHECK(status IN ('✅', '⭕️', '❌')),
        is_active BOOLEAN DEFAULT TRUE,
        UNIQUE(user, date)
      )
    `);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error; // 重新抛出错误，以便调用者可以处理
  }

  return db;
}

/**
 * 关闭数据库连接（示例函数，可根据需要调用）
 * @param {Database} db 数据库实例
 */
export function closeDB(db) {
  if (db) {
    db.close();
    console.log('Database connection closed.');
  }
}