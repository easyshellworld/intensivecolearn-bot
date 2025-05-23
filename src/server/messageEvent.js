import fs from 'fs';
import {  sendownertext } from "../tools/telegrembot.js"
import { helpCommand } from "./helpCommand.js"
import {
  sendActivePush,
  sendnumPush,
  sendAllPush
} from "../task/pushmessage.js"



const loaditempath = "./conf/item.json"
const loadtaskpath = './conf/task.json'
const loadforumpath = './conf/forum.json'


// 读取JSON文件
async function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`读取文件失败: ${error.message}`);
  }
}

// 写入JSON文件
async function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        reject(new Error(`写入文件失败: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}

// 错误处理函数
function handleError(error) {
  sendownertext(error.message);
  console.error("捕获到错误:", error.message);
}



// 更新JSON文件的通用函数
async function updateJsonFile(filePath, updateFunc) {
  try {
    const datajson = await readJsonFile(filePath);
    updateFunc(datajson);
    await writeJsonFile(filePath, datajson);
  } catch (error) {
    handleError(error);
  }
}

//message拼接函数
function  formatMessage(externalParam){
  if(externalParam[2]==="sendActivePush" || externalParam[2]==="sendAllPush"){
    const message = externalParam.slice(3).join(' ');
    return [message]
  }else if(externalParam[2]==="sendnumPush"){
    const message = externalParam.slice(4).join(' ');
    return [externalParam[3],message]
  }else{
    return externalParam.slice(3)
  }

}


async function deleteitemFromJson(filePath, externalParam) {
  let item = '';
  await updateJsonFile(filePath, (datajson) => {
    let tasks = datajson;
    item = JSON.stringify(tasks[externalParam[1]]);

    if (tasks.length > 0) {
      if (externalParam?.[2] !== undefined) {
        const num = parseInt(externalParam[1], 10) + parseInt(externalParam[2], 10) - 1;
        item = `${item}-${JSON.stringify(tasks[num])}\n${externalParam[2]}`;
        tasks.splice(externalParam[1], externalParam[2]);
      } else {
        tasks.splice(externalParam[1], 1);
      }
    }
    tasks.forEach((task, index) => {
      task.id = index;
    });
    datajson.task = tasks;
  });
  sendownertext(`删除：${item}`);
}


async function deleteTaskFromJson(filePath, externalParam) {
  let item = '';
  await updateJsonFile(filePath, (datajson) => {
    let tasks = datajson.task;
    item = JSON.stringify(tasks[externalParam[1]]);

    if (tasks.length > 0) {
      if (externalParam?.[2] !== undefined) {
        const num = parseInt(externalParam[1], 10) + parseInt(externalParam[2], 10) - 1;
        item = `${item}-${JSON.stringify(tasks[num])}\n${externalParam[2]}`;
        tasks.splice(externalParam[1], externalParam[2]);
      } else {
        tasks.splice(externalParam[1], 1);
      }
    }
    tasks.forEach((task, index) => {
      task.id = index;
    });
    datajson.task = tasks;
  });

  // Send notification with the removed item details
  sendownertext(`删除：${item}`);
}

// action 操作定义
const messageEvent = {
  initchatid: {
    action: async (externalParam, chatid) => {
      try {

        await updateJsonFile(loadtaskpath, (datajson) => {
          datajson.owner_chat_id = chatid

        });
        const chatidtext=JSON.stringify(chatid)
        sendownertext(`完成拥有者chatid更新：${chatidtext}`);
      } catch (error) {
        handleError(error);
      }
    },
  },
  addprogram: {
    action: async (externalParam, chatid) => {
      try {
        let newid = 0;
        await updateJsonFile(loaditempath, (datajson) => {
          newid = datajson.length
          datajson.push({
            id: newid,
            itemname: externalParam[1],
            git_url: `https://github.com/IntensiveCoLearning/${externalParam[1]}.git`,
            chat_id: chatid,
            start_date: externalParam[2],
            end_date: externalParam[3],
            signupDeadline: externalParam[4],
            active: true,
            registration_active: true,
          });

        });
        sendownertext(`加入：id:${newid}\n仓库链接：https://github.com/IntensiveCoLearning/${externalParam[1]}.git\n开始时间：${externalParam[2]} 结束时间：${externalParam[3]} 报名截止时间：${externalParam[4]}`);
      } catch (error) {
        handleError(error);
      }
    },
  },
  list: {
    action: async (externalParam) => {
      try {
        let data = '';
        if (externalParam?.[1] == "task") {
          data = fs.readFileSync(loadtaskpath, 'utf-8');
        }
        else if (externalParam?.[1] == "program") 
         {
          data = fs.readFileSync(loaditempath, 'utf-8');
        }
        else if (externalParam?.[1] == "forum") 
          {
           data = fs.readFileSync(loadforumpath, 'utf-8');
         }else{
          data = fs.readFileSync(loaditempath, 'utf-8');
        }
        const datajson = JSON.parse(data);
        sendownertext(JSON.stringify(datajson, null, 2));
      } catch (error) {
        handleError(error);
      }
    },
  },
  rmprogram: {
    action: async (externalParam) => {
      try {
        deleteitemFromJson(loaditempath, externalParam)
      } catch (error) {
        handleError(error);
      }
    },
  },
  changeid: {
    action: async (externalParam, chatid) => {
      try {
        await updateJsonFile(loaditempath, (datajson) => {

          datajson[externalParam[1]].chat_id = chatid;
  

        });
        const datajson = await readJsonFile(loaditempath)
        const itemchatid=JSON.stringify(datajson[externalParam[1]].chat_id)
        sendownertext(`改变${datajson[externalParam[1]].itemname}项目chatid：${itemchatid}`);

      } catch (error) {
        handleError(error);
      }
    },
  },
  clearchatid: {
    action: async (externalParam) => {
      try {
        await updateJsonFile(loaditempath, (datajson) => {

          datajson[externalParam[1]].chat_id = null;

        });
        const datajson = await readJsonFile(loaditempath)
        sendownertext(`改变${datajson[externalParam[1]].itemname}项目chatid：${datajson[externalParam[1]].chat_id}`);

      } catch (error) {
        handleError(error);
      }
    },
  },
  stop: {
    action: async (externalParam) => {
      try {
        await updateJsonFile(loaditempath, (datajson) => {

          datajson[externalParam[1]].active = false;

        });
        const datajson = await readJsonFile(loaditempath)
        sendownertext(`改变${datajson[externalParam[1]].itemname}项目激活状态：${datajson[externalParam[1]].active}`);
      } catch (error) {
        handleError(error);
      }
    },
  },
  start: {
    action: async (externalParam) => {
      try {
        await updateJsonFile(loaditempath, (datajson) => {

          datajson[externalParam[1]].active = true;

        });
        const datajson = await readJsonFile(loaditempath)
        sendownertext(`改变${datajson[externalParam[1]].itemname}项目激活状态：${datajson[externalParam[1]].active}`);
      } catch (error) {
        handleError(error);
      }
    },
  },

  sendall: {
    action: async (externalParam) => {
      try {
        const message = externalParam.slice(1).join(' ');
        sendAllPush(message)
      }
      catch (error) {
        handleError(error);
      }
    },
  },
  sendactive: {
    action: async (externalParam) => {
      try {
        const message = externalParam.slice(1).join(' ');
        sendActivePush(message)
      }
      catch (error) {
        handleError(error);
      }
    },
  },
  sendnum: {
    action: async (externalParam) => {
      try {
        const message = externalParam.slice(2).join(' ');
        sendnumPush(externalParam[1],message)
      }
      catch (error) {
        handleError(error);
      }
    },
  },
  addtask: {
    action: async (externalParam) => {
      try {
        let newid = 0;
        await updateJsonFile(loadtaskpath, (datajson) => {
          newid = datajson.task.length;
          const newTask = {
            id: newid,
            time: externalParam[1],
            task: externalParam[2],
          };

          // If externalParam[3] exists, populate the `args` field with [externalParam[3], externalParam[4], ...]
          if (externalParam[3] !== undefined) {
            newTask.args = formatMessage(externalParam);
          }

          datajson.task.push(newTask);
        });

        const argsDescription = externalParam[3]
          ? `\n参数:${JSON.stringify(formatMessage(externalParam))}`
          : '';
        sendownertext(`加入定时任务:\nid:${newid}\n时间:${externalParam[1]}\n函数:${externalParam[2]}\n${argsDescription}`);

      } catch (error) {
        handleError(error);
      }
    },
  },
  rmtask: {
    action: async (externalParam) => {
      try {
        deleteTaskFromJson(loadtaskpath, externalParam)
      } catch (error) {
        handleError(error);
      }
    },
  },  
  addforum: {
    action: async (externalParam, chatid) => {
      try {
        let newid = 0;
        await updateJsonFile(loadforumpath, (datajson) => {
          newid = datajson.length
          datajson.push({
            id: newid,
            category: externalParam[1],
            chat_id: chatid,
            
          });

        });
        const chatidtext=JSON.stringify(chatid)
        sendownertext(`加入：id:${newid}\n板块${externalParam[1]}，频道：${chatidtext}`);
      } catch (error) {
        handleError(error);
      }
    },
  },
  rmforum: {
    action: async (externalParam) => {
      try {
        deleteitemFromJson(loadforumpath, externalParam)
      } catch (error) {
        handleError(error);
      }
    },
  },

  help: {
    action: async (externalParam) => {
      try {
        helpCommand();
      } catch (error) {
        handleError(error);
      }
    },

  }
};

export default messageEvent;
