// src/utils/dbManager.js
import Database from 'better-sqlite3';

/**
 * 初始化数据库并创建表（如果表不存在）
 * @param {string} dbPath 数据库文件路径
 * @returns {Database} 返回数据库实例
 */
export function initDB(dbPath) {
  let db;
  try {
    db = new Database(dbPath);

    // 创建表（如果表不存在）
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo TEXT,
        user TEXT,
        date TEXT,
        note TEXT
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