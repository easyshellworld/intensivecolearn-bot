import { Bot } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();



const BOT_TOKEN = process.env.TG_BOT;

const bot = new Bot(BOT_TOKEN);

bot.on('message', (ctx) => {
  console.log(JSON.stringify(ctx,null,2))
  const chatId = ctx.chat.id;
  console.log('当前 chat_id:', chatId);

  ctx.reply(`你的 chat_id 是：${chatId}`);
});

await bot.api.sendMessage("2089171047", '这是我主动发的一条消息');

console.log('test')

bot.start();