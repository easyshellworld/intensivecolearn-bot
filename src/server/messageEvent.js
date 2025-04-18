import fs from 'fs';
import { sendMarkdownToTelegram, sendownertext} from "../tools/telegrembot.js"
import { helpCommand } from "./helpCommand.js"
import { sendWeekPush } from '../task/pushmessage.js';



const loaditempath="./conf/item.json"
const loadtaskpath='./conf/task.json'


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
    fs.writeFile(filePath, JSON.stringify(data,null,2), 'utf8', (err) => {
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
    action: async (externalParam,chatid) => {
      try {
        
        await updateJsonFile(loadtaskpath, (datajson) => {    
          datajson.owner_chat_id=chatid
          
        });
        sendownertext(`完成拥有者chatid更新：${chatid}`);
      } catch (error) {
        handleError(error);
      }
    },
  },
  add: {
    action: async (externalParam,chatid) => {
      try {
        let newid=0;
        await updateJsonFile(loaditempath, (datajson) => {    
          newid=datajson.length
          datajson.push({
            id:newid,
            itemname: externalParam[1],
            git_url: `https://github.com/IntensiveCoLearning/${externalParam[1]}.git`,
            chat_id: chatid,
            start_date:externalParam[2],
            end_date:externalParam[3],
            signupDeadline:externalParam[4],
            active:true,
            registration_active:true,
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
        if(externalParam?.[1] == "1"){
          data = fs.readFileSync(loadtaskpath, 'utf-8');
        }
        else{
          data = fs.readFileSync(loaditempath, 'utf-8');
        } 
        const datajson = JSON.parse(data);
        sendownertext(JSON.stringify(datajson, null, 2));
      } catch (error) {
        handleError(error);
      }
    },
  },
  rm: {
    action: async (externalParam) => {
      try {
        deleteitemFromJson(loaditempath, externalParam)
      } catch (error) {
        handleError(error);
      }
    },
  },
  changeid: {
    action: async (externalParam,chatid) => {
      try {
        await updateJsonFile(loaditempath, (datajson) => {    
         
          datajson[externalParam[1]].chat_id=chatid;
            
          });
        const datajson= await readJsonFile(loaditempath)  
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
         
          datajson[externalParam[1]].active=false;
            
          });
        const datajson= await readJsonFile(loaditempath)  
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
         
          datajson[externalParam[1]].active=true;
            
          });
        const datajson= await readJsonFile(loaditempath)  
        sendownertext(`改变${datajson[externalParam[1]].itemname}项目激活状态：${datajson[externalParam[1]].active}`);
      } catch (error) {
        handleError(error);
      }
    },
  },
 
  sendall: {
    action: async (externalParam) => {
      try {
        const itemdata=await readJsonFile(loaditempath)
        for(const item of itemdata){
          if(item.active === true){
            await sendMarkdownToTelegram(item.chat_id,externalParam[1])
          }
          
        }
        
       // sendownertext();
      } catch (error) {
        handleError(error);
      }
    },
  }, 
  adds: {
    action: async (externalParam) => {
      try {
          let newid=0;
          await updateJsonFile(loadtaskpath, (datajson) => { 
            newid=datajson.task.length;
            const newTask = {
              id:newid,
              time: externalParam[1],
              task: externalParam[2],
            };
      
            // If externalParam[3] exists, populate the `args` field with [externalParam[3], externalParam[4], ...]
            if (externalParam[3] !== undefined) {
              newTask.args = externalParam.slice(3);
            }
      
            datajson.task.push(newTask);
          });

          const argsDescription = externalParam[3]
          ? `\n参数:${JSON.stringify(externalParam.slice(3))}`
          : '';
          sendownertext(`加入定时任务:\nid:${newid}\n时间:${externalParam[1]}\n函数:${externalParam[2]}\n${argsDescription}`);
   
      } catch (error) {
        handleError(error);
      }
    },
  },
  rms: {
    action: async (externalParam) => {
      try {
        deleteTaskFromJson(loadtaskpath, externalParam)
      } catch (error) {
        handleError(error);
      }
    },
  },
 
  help:{
    action: async (externalParam) => {
      try {
        helpCommand();
      } catch (error) {
        handleError(error);
      }
    },

  },
  sendnews:{
    action: async (externalParam) => {
      try {
        sendWeekPush();
      } catch (error) {
        handleError(error);
      }
    },

  }


};

export default messageEvent;
