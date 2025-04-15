// src/server/serverRunner.js
import { startMCPServer } from './mcpServer.js';
import { initDB } from '../dbManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置数据库路径
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'datadb', 'notes.db');

// 这个文件作为独立进程运行，启动MCP服务器
async function main() {
  try {
    console.log("初始化数据库连接...");
    // 使用现有的initDB函数来获取数据库连接
    const db = initDB(DB_PATH);
    console.log("数据库连接成功:", DB_PATH);
    
    console.log("启动MCP服务器...");
    // 启动服务器
    const server = await startMCPServer(db);
    console.log("MCP服务器启动成功");
    
    // 处理进程关闭事件
    process.on('SIGINT', () => {
      console.log("正在关闭服务器...");
      // 关闭数据库连接
      db.close();
      console.log("数据库连接已关闭");
      process.exit(0);
    });
    
    // 处理未捕获的异常
    process.on('uncaughtException', (err) => {
      console.error("未捕获的异常:", err);
      // 关闭数据库连接
      db.close();
      process.exit(1);
    });
    
  } catch (error) {
    console.error("服务器启动失败:", error);
    process.exit(1);
  }
}

// 执行主函数
main();