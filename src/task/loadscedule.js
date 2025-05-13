import fs from 'fs';
import moment from 'moment-timezone';
import schedule from 'node-schedule';
import chokidar from 'chokidar';

import {
    checkItem,
    pullgitdata,
    sendDayPush,
    sendWeekPush,
    sendActivePush,
    sendnumPush,
    sendAllPush,
    sendDailyRegistrationReport,
    sendForum
} from "./pushmessage.js";



// 函数映射表
const functions = {
    checkItem,
    pullgitdata,
    sendDayPush,
    sendWeekPush,
    sendActivePush,
    sendnumPush,
    sendAllPush,
    sendDailyRegistrationReport,
    sendForum
   
};

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 读取 JSON 文件
function loadTasks(jsonFile) {
    try {   
        const data = fs.readFileSync(jsonFile, 'utf8');
        const taskjson=JSON.parse(data)    
        return taskjson.task;
    } catch (error) {
        throw new Error(`Failed to read or parse ${jsonFile}: ${error.message}`);
    }
}

// 解析任务时间为 cron 表达式
function parseSchedule(task, timezone) {
    // 使用上海时间解析，但生成 UTC 时间的任务
    const taskTime = moment.tz(task.time, 'YYYY-MM-DD-HH:mm', timezone); // 上海时区
    const utcTime = taskTime.utc(); // 转换为 UTC 时间

    if (task.time.startsWith('D')) {
        // 每天定时任务：D00:30
        const time = task.time.slice(1); // 获取00:30部分
        const [hour, minute] = time.split(':').map(Number);
        const shanghaiTime = moment.tz(`${hour}:${minute}`, 'HH:mm', 'Asia/Shanghai');
        const utcTime = shanghaiTime.utc(); // 转换为 UTC 时间

        // 获取 UTC 时间的小时和分钟
        const utcHour = utcTime.hours();
        const utcMinute = utcTime.minutes();

        // 返回对应的 cron 表达式（按 UTC 时间计算）
        return `${utcMinute} ${utcHour} * * *`; // 每天定时任务的 cron 表达式，按 UTC 时间
    }

    if (task.time.startsWith('W')) {
        // 每周某天某时任务：w2:22:20（每周二 22:20）
        const [weekDayStr, timeStr] = task.time.slice(1).split(':');
        const weekDay = parseInt(weekDayStr, 10); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const hour = parseInt(timeStr, 10);
        const minute = parseInt(task.time.split(':')[2], 10);

        const shanghaiTime = moment.tz({ hour, minute }, 'Asia/Shanghai');
        const utcTime = shanghaiTime.utc();

        return `${utcTime.minutes()} ${utcTime.hours()} * * ${weekDay}`;
    }

    if (task.time.startsWith('H')) {
        // 每小时某分钟任务：H2（每小时第2分钟）
        const minute = task.time.slice(1); // 获取分钟数
        return `${minute} * * * *`; // 每小时某分钟执行任务的 cron 表达式
    }

    if (task.time.startsWith('M')) {
        // 每多少分钟执行任务：M15（每15分钟）
        const interval = task.time.slice(1); // 获取15部分
        return `*/${interval} * * * *`; // 每多少分钟执行的 cron 表达式
    }

    if (task.time.includes('-')) {
        // 具体某个时间点任务：2025-01-20-20:30
        return `${utcTime.minutes()} ${utcTime.hours()} ${utcTime.date()} ${utcTime.month() + 1} *`; // 转换为 UTC 时间的 Cron 表达式
    }

    throw new Error(`Invalid schedule format for task: ${JSON.stringify(task)}`);
}

// 解析 JSON 中的任务
function parseTasks(jsonFile, timezone) {
    const tasks = loadTasks(jsonFile);
    return tasks.map(task => {
        try {
            task.parsedSchedule = parseSchedule(task, timezone);
            return task;
        } catch (error) {
            console.error(`Error parsing task ${task.task}: ${error.message}`);
            return null; // 任务解析失败则返回 null
        }
    }).filter(task => task !== null); // 过滤掉解析失败的任务
}

// 取消现有的定时任务
function cancelExistingJobs(scheduledJobs) {
    Object.values(scheduledJobs).forEach(job => job.cancel());
    return {}; // 重新初始化任务对象
}

// 设置新的定时任务
function scheduleTasks(tasks, functions, scheduledJobs) {
    tasks.forEach((task, index)=> {
        const func = functions[task.task];
        if (func) {
            const job = schedule.scheduleJob(task.parsedSchedule, () => {
                console.log(`Running task: ${index} ${task.task}`);
                if (task.args) {
                    func(...task.args); // 调用内部函数并传递参数
                  } else {
                    func(); // 调用内部函数（无参数）
                  }
                
            });
            scheduledJobs[index] = job; // 任务存储
        } else {
            console.error(`Function for task "${task.task}" not found!`);
        }
    });
}

// 主函数：初始化调度器
function initScheduler(jsonFile, timezone = 'Asia/Shanghai') {
    let scheduledJobs = {};

    // 初始化并加载任务
    function loadAndScheduleTasks() {
        const tasks = parseTasks(jsonFile, timezone);
        scheduledJobs = cancelExistingJobs(scheduledJobs);
        scheduleTasks(tasks, functions, scheduledJobs);
    }

    // 加载并调度任务
    loadAndScheduleTasks();

    // 监听文件变更并防抖处理
    const reloadTasks = debounce(() => {
        console.log('Detected changes in schedule.json. Reloading tasks...');
        try {
            loadAndScheduleTasks();
            console.log('Tasks reloaded successfully.');
        } catch (error) {
            console.error('Failed to reload tasks:', error.message);
        }
    }, 1000); // 防抖时间设置为 1 秒

    chokidar.watch(jsonFile).on('change', reloadTasks);
}

/* // 使用示例
const jsonFile = 'schedule.json';
initScheduler(jsonFile);
 */

export {
    initScheduler
};
