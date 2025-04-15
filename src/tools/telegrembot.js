
import axios from 'axios';
import { loadConfig,findItemByName,getTGtoken } from '../utils/config.js';

import dotenv from 'dotenv';
dotenv.config();



const BOT_TOKEN = process.env.TG_BOT;


//const BOT_TOKEN=await getTGtoken()


async function sendMarkdownToTelegram(text,CHAT_ID) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
    try {
      const response = await axios.post(url, {
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      return response.data;
    } catch (error) {
      console.error('发送失败:', error.response ? error.response.data : error.message);
      return ('发送失败:', error.response ? error.response.data : error.message)
    }
  }

async function getchatid(itemname){
  const config = await loadConfig();
  const repoInfo=findItemByName(config,itemname)
  return repoInfo.chat_id
}


export async function telegrembot(itemname,tgmessage){
  const chat_id=await getchatid(itemname);
  const results=await sendMarkdownToTelegram(tgmessage,chat_id)
  return results
}


/*  telegrembot("Ethereum-Protocol-Fellowship-3","test12121") */
 




