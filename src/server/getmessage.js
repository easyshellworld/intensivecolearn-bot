//import { sendfeishutext} from '../com/sendfeishu.js';
import messageEvent from "./messageEvent.js";
import { sendownertext} from "../tools/telegrembot.js"

function cleanSlashCommand(text)  {
    return text.startsWith('/') ? text.slice(1) : text;
  }

async function getmessage(content,chatId,messagethreadid) {
  try {
  
    const mytext = cleanSlashCommand(content)
    const mytest = mytext.split(" ")

    messageEvent[mytest[0]]
    if (messageEvent[mytest[0]] && typeof messageEvent[mytest[0]].action === "function") {
      await messageEvent[mytest[0]].action(mytest,chatId,messagethreadid);
    } else {
     // console.log('未找到事件');
      //sendownertext('未找到事件');
    }
  } catch (error) {
    // 捕获错误并处理
    sendownertext(error.message);
    console.error("捕获到错误:", error.message);
  }


 

}


export {
  getmessage
}

