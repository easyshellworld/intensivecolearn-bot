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


export function findItemByName(items, itemname) {
  return items.find(item => item.itemname === itemname);
}

export async function getTGtoken() {
  const configPath = path.join(__dirname, '..', '..', 'conf', 'otherconf.json');
  const data = await fs.readFile(configPath, 'utf-8');
  const datajson = JSON.parse(data);
  return datajson.TG_BOT

}