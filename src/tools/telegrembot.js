

import { loadConfig, findItemByName, getownerchatid } from '../utils/config.js';
import { Bot } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();



const BOT_TOKEN = process.env.TG_BOT;



const bot = new Bot(BOT_TOKEN);

export async function sendownertext(text) {
  const ownerchatid = await getownerchatid();
  const MAX_LENGTH = 4096;

  if (text.length <= MAX_LENGTH) {
    await bot.api.sendMessage(ownerchatid, text);
  } else {
    // 按最大长度拆分消息
    for (let i = 0; i < text.length; i += MAX_LENGTH) {
      const chunk = text.slice(i, i + MAX_LENGTH);
      await bot.api.sendMessage(ownerchatid, chunk);
    }
  }
}
export async function sendMarkdownToTelegram(chatId, text) {
  if (chatId != '' || chatId!=null) {
    try {
      const response = await bot.api.sendMessage(chatId, text, {
        parse_mode: 'Markdown'
      });
      return response;
    } catch (error) {
      console.error('发送失败:', error);
      return error;
    }
  }
}


async function getchatid(itemname) {
  const config = await loadConfig();
  const repoInfo = findItemByName(config, itemname)
  return repoInfo.chat_id
}


export async function telegrembot(itemname, tgmessage) {
  const chat_id = await getchatid(itemname);
  const results = await sendMarkdownToTelegram(chat_id, tgmessage)
  return results
}








