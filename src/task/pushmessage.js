import {
  getdailycheckin,
  getgitdata,
  getweekdbdata,
  getdaydbdata,
} from '../tools/getgitdata.js';
import { loadConfig, writerConfig } from '../utils/config.js';
import { sendMarkdownToTelegram, sendownertext } from '../tools/telegrembot.js'
import { getzhipu, getdeepseek } from "../aiProvider/aiProvider.js"

function handleError(error) {
  sendownertext(error.message);
  console.error("捕获到错误:", error.message);
}

async function checkItem() {
  try {
    const itemdata = await loadConfig();
    const now = new Date();

    for (const item of itemdata) {
      // 处理 active
      if (item.active) {
        const endDate = new Date(item.end_date);
        if (now > endDate) {
          item.active = false;
        }
      }

      // 处理 registration_active
      if (item.registration_active) {
        const deadline = new Date(item.signupDeadline);
        if (now > deadline) {
          item.registration_active = false;
        }
      }

    }

    await writerConfig(itemdata);
  } catch (error) {
    handleError(error);
  }
}


async function pullgitdata() {
  try {
    const itemdata = await loadConfig()
    for (const item of itemdata) {
      if (item.active === true) {
        await getgitdata(item.itemname)
        await getdailycheckin(item.itemname)
      }
    }
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    console.log(`${formattedDate}数据更新完成`)
  } catch (error) {
    handleError(error);
  }

}

async function sendDayPush() {

  const itemdata = await loadConfig()
  for (const item of itemdata) {
    if (item.active === true && item.registration_active === false) {
      try {
        const daydata = getdaydbdata(item.itemname, 1)[0]
        const markdowntext = `**${item.itemname}**\n昨日共学情况:\n完成学习人数：${daydata.completed_checkins}\n请假人数：${daydata.vacation_days}\n淘汰人数：${daydata.eliminated_users}\n当前存活人数：${daydata.active_users}\n笔记链接：${item.git_url}`
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
        const weekdata = getweekdbdata(item.itemname, 7)
        const markdowntext = await getdeepseek(weekdata, 0)
        await sendMarkdownToTelegram(item.chat_id, markdowntext + "\n笔记链接：" + item.git_url)
        console.log(`完成${item.itemname}每周发送`)
      } catch (error) {
        handleError(error);
      }

    }
  }
}

async function sendActivePush(message) {
  const itemdata = await loadConfig()
  for (const item of itemdata) {
    if (item.active === true) {
      try {
        await sendMarkdownToTelegram(item.chat_id, message)
        console.log(`完成${item.itemname}群组信息发送`)
      } catch (error) {
        handleError(error);
      }

    }
  }
}

async function sendnumPush(item_id, message) {
  const itemdata = await loadConfig()
  let numbers = [];
  if (item_id.includes(',')) {
    // 增加不连续数字 (e.g., "2,3,4,5,7,8")
    numbers = item_id.split(',').map(Number);
  } else if (item_id.includes('-')) {
    // 连续数字 (e.g., "1-5")
    const [start, end] = item_id.split('-').map(Number);
    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }
  } else {  
    numbers.push(Number(item_id));
  }

  for (const num of numbers) {
    try {
      await sendMarkdownToTelegram(itemdata[num].chat_id, message);
      console.log(`完成${itemdata[num].itemname}群组信息发送`);
    } catch (error) {
      handleError(error);
    }
  }
}


async function sendAllPush(message) {
  const itemdata = await loadConfig()
  for (const item of itemdata) {

    try {
      await sendMarkdownToTelegram(item.chat_id, message)
      console.log(`完成${item.itemname}群组信息发送`)
    } catch (error) {
      handleError(error);
    }

  }
}




export {
  checkItem,
  pullgitdata,
  sendDayPush,
  sendWeekPush,
  sendActivePush,
  sendnumPush,
  sendAllPush


}



