# intensivecolearn-bot

## 项目简介
* **Intensivecolearn-bot**是“残酷共学”伴生项目，依托 Telegram 机器人与大型语言模型（LLM）协作，旨在对“残酷共学”共学者的学习情况进行统计分析与智能管理。目前已实现的功能包括：通过机器人添加、删除项目，自动更新统计数据，定时推送学习进展，以及灵活添加学习任务等，助力共学过程更高效、有序。

## Build
```
npm install
```

## init
* 编辑环境变量：
```
DEEPSEEK_KEY=     # LLM模型API的key              
TG_BOT=           # Telegram bot key   
OWNER=            # 管理人员Telegram用户名

```
* 执行初始化
```
npm run initinstall
```
* 运行程序
```
npm run start
```
* 管理人员激活
在Telegram与机器人聊天界面输入以下命令：`/initchatid`

## 功能命令简介
* **/initchatid`**
  初始化拥有者 chatid，例如：  
  `/initchatid`

* **/add `<项目名称>` `<开始时间>` `<结束时间>` `<报名截止时间>`**
 需要在对应的聊天频道操作， 添加新项目，自动生成 GitHub 仓库链接，例如：  
  `/add test-project 2025-04-20 2025-05-20 2025-04-25`

* **/list**
  查看所有项目或任务，默认列出项目列表，添加参数 `1` 可查看定时任务，例如：  
  `/list`  
  `/list 1`

* **/rm `<项目ID>`**
  删除指定项目，例如：  
  `/rm 2`

* **/changeid `<项目ID>` `<新chatid>`**
  需要在对应的聊天频道操作，更换项目绑定的 chatid，例如：  
  `/changeid 2`

* **/stop `<项目ID>`**
  将指定项目设为非激活状态，例如：  
  `/stop 1`

* **/start `<项目ID>`**
  将指定项目重新设为激活状态，例如：  
  `/start 1`

* **/sendall `<Markdown内容>`**
  向所有激活项目群发送指定 Markdown 内容，例如：  
  `/sendall **大家好，本周总结如下：**`

* **/adds `<时间>` `<函数名>` [参数1 参数2 ...]**
  添加一个定时任务，指定时间、调用函数及参数，例如：  
  `/adds W3:19:30 * * * sendall **早安！今天继续努力学习！**`

```
  时间设置格式：      # 时区UTC+8
  D19:20            # 每天19：30
  W3:19:30          # 每周三19:30
  2025-04-17-19:30  # 具体时间2025年4月17日19:30
```

* **/rms `<任务ID>`**
  删除指定的定时任务，例如：  
  `/rms 0`

* **/help**
  查看所有可用命令的说明，例如：  
  `/help`



