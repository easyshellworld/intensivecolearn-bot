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
  `/sendall **最新学习计划!**`

* **/sendactive `<Markdown内容>`**  
  向所有活跃项目群发送指定 Markdown 内容，例如：  
  `/sendactive **本周开始新一轮冲刺！**`

* **/sendnum `<Markdown内容>` `<编号范围>`**  
  向指定编号范围内的项目群发送 Markdown 内容，例如：  
  `/sendnum  1-5 **进度更新：模块完成80%** `

* **/adds `<时间>` `<函数名>` [参数1 参数2 ...]**
  添加一个定时任务，指定时间、调用函数及参数，例如：  
  `/adds W3:19:30 sendall 最新学习计划!`

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


## 默认可执行定时任务方法
* **checkItem()**
  * **功能**：检查并更新项目状态标志
    * 加载配置数据(`loadConfig()`)
    * 获取当前时间
    * 遍历每个项目项目，根据时间自动更新两个状态标志：
      * `active`：如果当前时间超过结束日期(`end_date`)，设为`false`
      * `registration_active`：如果当前时间超过报名截止日期(`signupDeadline`)，设为`false`
    * 将更新后的数据写回配置文件(`writerConfig()`)
    * 错误处理：捕获并处理过程中的任何错误

* **pullgitdata()**
  * **功能**：拉取活跃项目的Git数据
    * 加载配置数据
    * 遍历所有项目，只对`active === true`的项目：
      * 获取项目Git数据(`getgitdata()`)
      * 获取每日签到数据(`getdailycheckin()`)
    * 记录数据更新完成的日期
    * 错误处理：捕获并处理过程中的任何错误

* **sendDayPush()**
  * **功能**：发送每日学习数据统计
    * 加载配置数据
    * 遍历每个项目，只处理活跃且报名已关闭的项目(`active === true && registration_active === false`)
    * 获取前一天的数据统计(`getdaydbdata()`)
    * 生成包含以下内容的Markdown文本：
      * 项目名称
      * 完成学习人数
      * 请假人数
      * 淘汰人数
      * 当前存活人数
      * 笔记链接
    * 通过Telegram发送统计信息(`sendMarkdownToTelegram()`)
    * 错误处理：捕获并处理过程中的任何错误

* **sendWeekPush()**
  * **功能**：发送每周学习数据汇总
    * 加载配置数据
    * 遍历每个项目，只处理活跃且报名已关闭的项目
    * 获取过去7天的数据统计(`getweekdbdata()`)
    * 使用AI辅助分析生成周报(`getdeepseek()`)
    * 通过Telegram发送周报及笔记链接
    * 错误处理：捕获并处理过程中的任何错误

* **sendActivePush(message)**
  * **功能**：向所有活跃项目群发送消息
    * 参数：`message` - 要发送的Markdown格式消息
    * 加载配置数据
    * 遍历每个项目，只处理活跃项目(`active === true`)
    * 向项目的Telegram群组发送指定消息
    * 记录发送完成的日志
    * 错误处理：捕获并处理过程中的任何错误

* **sendnumPush(item_id, message)**
  * **功能**：向指定ID范围的项目群发送消息
    * 参数：
      * `item_id` - 格式为"起始ID-结束ID"的字符串，例如"2-5"
      * `message` - 要发送的Markdown格式消息
    * 解析ID范围，获取起始和结束ID
    * 加载配置数据
    * 循环处理指定范围内的项目
    * 向每个项目的Telegram群组发送指定消息
    * 记录发送完成的日志
    * 错误处理：捕获并处理过程中的任何错误

* **sendAllPush(message)**
  * **功能**：向所有项目群发送消息（不论活跃状态）
    * 参数：`message` - 要发送的Markdown格式消息
    * 加载配置数据
    * 遍历所有项目（包括非活跃项目）
    * 向每个项目的Telegram群组发送指定消息
    * 记录发送完成的日志
    * 错误处理：捕获并处理过程中的任何错误


