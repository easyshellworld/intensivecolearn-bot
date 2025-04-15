// src/server/mcpServer.js
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


//import { startMCPServer } from './mcpServer.js';
import { initDB } from '../dbManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置数据库路径
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'datadb', 'notes.db');

// 创建 MCP 服务器实例，只负责读取现有数据库
export function setupMCPServer(db) {
  const server = new McpServer({
    name: "MCP Notes Service",
    version: "1.0.0"
  });
  
  server.prompt(
    "echo",
    () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please process this message: `
        }
      }]
    })
  );
  // 注册一个资源，用于获取所有笔记
  server.resource(
    "config",
    "config://app",
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: "App configuration here"
      }]
    })
  );
  server.resource("notes", "notes://recent", async (uri) => {
    try {
      const rows = db
        .prepare(`
          SELECT user, date, note
          FROM notes
          WHERE date >= strftime('%Y.%m.%d', date('now', '-7 days')) 
            AND date <= strftime('%Y.%m.%d', date('now'))
            AND LENGTH(note) >= 10
          ORDER BY date DESC;
        `)
        .all();
  
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(rows),
          },
        ],
      };
    } catch (err) {
      return { error: err.message };
    }
  });
  return server;
}

// 启动服务器，使用 stdio 传输
/* export async function startMCPServer(db) {
  const server = setupMCPServer(db);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Notes Service is running");
  return server;
} */
// 启动 MCP 服务器
async function startMCPServer() {
  try {
    const db = initDB(DB_PATH);
    const server = setupMCPServer(db);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("✅ MCP Notes Service is running");
  } catch (error) {
    console.error("❌ MCP Server failed to start:", error);
    process.exit(1);
  }
}

// 运行 MCP 服务器
startMCPServer();