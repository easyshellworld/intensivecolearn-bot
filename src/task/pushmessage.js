
import { loadConfig, writerConfig } from '../utils/config.js';
import { sendMarkdownToTelegram, sendownertext } from '../tools/telegrembot.js'
import { getzhipu,getdeepseek } from "../aiProvider/aiProvider.js"
import {getnews} from "../tools/getcoinnew.js"

function handleError(error) {
  sendownertext(error.message);
  console.error("捕获到错误:", error.message);
}




async function sendDayPush() {

  const itemdata = await loadConfig()
  for (const item of itemdata) {
    if (item.active === true && item.registration_active === false) {
      try {
       
        const markdowntext = ``
        await sendMarkdownToTelegram(item.chat_id, markdowntext)
        console.log(`完成${item.itemname}每天发送`)
      } catch (error) {
        handleError(error);
      }
    }

  }


}

async function sendWeekPush() {
  const itemdata = await loadConfig()
  for (const item of itemdata) {
    if (item.active === true && item.registration_active === false) {
      try {
        const weekdata = await getnews() //获取数据
        const markdowntext = await getdeepseek(JSON.stringify(weekdata), 0) //调用模型
        await sendMarkdownToTelegram(item.chat_id, markdowntext)
        console.log(`完成${item.itemname}每周发送`)
      } catch (error) {
        handleError(error);
      }

    }
  }
}


export {

  sendDayPush,
  sendWeekPush,

}



