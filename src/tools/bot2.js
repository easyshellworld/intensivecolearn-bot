import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
dotenv.config();



const BOT_TOKEN = process.env.TG_BOT;

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply('欢迎'));
bot.on(message('text'), (ctx) => {
    console.log(JSON.stringify(ctx,null,2))
    const chatId = ctx.chat.id;
  ctx.reply(`你的 chat id 是：${chatId}`);
  ctx.reply(`你发了: ${ctx.message.text}`);
});

bot.launch();
