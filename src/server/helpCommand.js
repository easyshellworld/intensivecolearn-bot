import {  sendMarkdownToTelegram} from "../tools/telegrembot.js"
import { getownerchatid} from '../utils/config.js';


export async function helpCommand() {
    const chatid=await getownerchatid()
    const ownerchatid={chat_id:chatid}
   
  const helpMessage = `
* **/initchatid**
  初始化拥有者 chatid，例如：
 /initchatid

* **/addprogram<项目名称><开始时间><结束时间><报名截止时间>**
  需要在对应的聊天频道操作，添加新项目，自动生成 GitHub 仓库链接，例如：
 /addprogram test-project 2025-04-20 2025-05-20 2025-04-25

* **/list**
  查看所有项目或任务，默认或者<program>列出项目列表，添加参数<task>可查看定时任务，例如：  
  /list
  /list program 
  /list task

* **/rmprogram<项目ID>**
  删除指定项目，例如：
 /rmprogram 2

* **/changeid<项目ID>**
  需要在对应的聊天频道操作，更换项目绑定的 chatid，例如：
 /changeid 2 

* **/clearchatid<项目ID>**
 清除对应项目绑定的 chatid，例如：
 /clearchatid 0

* **/stop<项目ID>**
  将指定项目设为非激活状态，例如：
 /stop 1

* **/start<项目ID>**
  将指定项目重新设为激活状态，例如：
 /start 1

* **/sendall<Markdown内容>**
  向所有激活项目群发送指定 Markdown 内容，例如：
 /sendall **大家好，本周总结如下：**

* **/sendactive <Markdown内容>**  
  向所有活跃项目群发送指定 Markdown 内容，例如：  
  /sendactive **本周开始新一轮冲刺！**

* **/sendnum <Markdown内容> <编号范围>**  
  向指定编号范围内的项目群发送 Markdown 内容，例如：  
  /sendnum  1-5 **进度更新：模块完成80%**   发送连续编号频道
  /sendnum  2,5  **进度更新：模块完成80%**  发送指定编号频道


* **/addtask<时间><函数名> [参数1 参数2 ...]**
  添加一个定时任务，指定时间、调用函数及参数，例如：
 /addtask W3:19:30 sendAllPush 最新学习计划!
  时间设置格式：      # 时区UTC+8
  D19:20            # 每天19：30
  W3:19:30          # 每周三19:30
  2025-04-17-19:30  # 具体时间2025年4月17日19:30

* **/rmtask<任务ID>**
  删除指定的定时任务，例如：
 /rms 0

* **/help**
  查看所有可用命令的说明，例如：
 /help
  `;
  sendMarkdownToTelegram(ownerchatid,helpMessage);
}


