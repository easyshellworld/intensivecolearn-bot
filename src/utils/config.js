// src/utils/config.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadConfig() {
  const configPath = path.join(__dirname, '..', '..', 'conf', 'item.json');
  const data = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(data);
}

export async function writerConfig(data) {
  const configPath = path.join(__dirname, '..', '..', 'conf', 'item.json');
  return new Promise((resolve, reject) => {
    fs.writeFile(configPath, JSON.stringify(data,null,2), 'utf8', (err) => {
      if (err) {
        reject(new Error(`写入文件失败: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}


export function findItemByName(items, itemname) {
  return items.find(item => item.itemname === itemname);
}

export async function getownerchatid() {
  const configPath = path.join(__dirname, '..', '..', 'conf', 'task.json');
  const data = await fs.readFile(configPath, 'utf-8');
  const datajson = JSON.parse(data);
  return datajson.owner_chat_id.chat_id

}