import {  sendMarkdownToTelegram} from "../tools/telegrembot.js"
import { getownerchatid} from '../utils/config.js';


export async function helpCommand() {
    const ownerchatid=await getownerchatid()
  const helpMessage = `
* **/initchatid**
  初始化拥有者 chatid，例如：
 /initchatid

* **/add<项目名称><开始时间><结束时间><报名截止时间>**
  添加新项目，自动生成 GitHub 仓库链接，例如：
 /add test-project 2025-04-20 2025-05-20 2025-04-25

* **/list**
  查看所有项目或任务，默认列出项目列表，添加参数1 可查看定时任务，例如：
 /list
 /list 1

* **/rm<项目ID>**
  删除指定项目，例如：
 /rm 2

* **/changeid<项目ID><新chatid>**
  需要在对应的聊天频道操作，更换项目绑定的 chatid，例如：
 /changeid 2 

* **/stop<项目ID>**
  将指定项目设为非激活状态，例如：
 /stop 1

* **/start<项目ID>**
  将指定项目重新设为激活状态，例如：
 /start 1

* **/sendall<Markdown内容>**
  向所有激活项目群发送指定 Markdown 内容，例如：
 /sendall **大家好，本周总结如下：**

* **/adds<时间><函数名> [参数1 参数2 ...]**
  添加一个定时任务，指定时间、调用函数及参数，例如：
 /adds 0 9 * * * sendall **早安！今天继续努力学习！**

* **/rms<任务ID>**
  删除指定的定时任务，例如：
 /rms 0

* **/help**
  查看所有可用命令的说明，例如：
 /help
  `;
  sendMarkdownToTelegram(ownerchatid,helpMessage);
}


