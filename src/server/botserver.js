import { Bot } from 'grammy';
import dotenv from 'dotenv';
import {getmessage} from './getmessage.js'
dotenv.config();



const BOT_TOKEN = process.env.TG_BOT;
const owner= process.env.OWNER



export function startBot() {
    const bot = new Bot(BOT_TOKEN);
  
    bot.on('message', async (ctx) => {
      

      const chatId={
        chat_id:ctx.chat.id,
        message_thread_id:ctx.message.message_thread_id
      }
      
      // 如果消息是来自于设定的 owner 用户
      if (ctx.from.username === owner) {
        console.log('收到消息:', ctx.message.text);
       // console.log(JSON.stringify(ctx,null,2));
       // console.log(ctx.message.message_thread_id)
        await getmessage(ctx.message.text, chatId);
      }
    });
  
    bot.start();
    console.log("bot开始运行")
  }