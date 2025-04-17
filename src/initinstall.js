import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function initInstall() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '..');
    const folders = [
        path.join(rootDir, 'data', 'datadb'),
        path.join(rootDir, 'data', 'githubgit'),
        path.join(rootDir, 'conf'),
    ];

    const files = [
        {
            path: path.join(rootDir, 'conf', 'item.json'),
            content: JSON.stringify([
                {
                    id: 0,
                    itemname: "Ethereum-Protocol-Fellowship-3",
                    git_url: "https://github.com/IntensiveCoLearning/Ethereum-Protocol-Fellowship-3.git",
                    chat_id: -4785073974,
                    start_date: "2025-03-10",
                    end_date: "2025-04-20",
                    signupDeadline: "2025-03-11",
                    active: false,
                    registration_active: false
                }
            ], null, 2)
        },
        {
            path: path.join(rootDir, 'conf', 'task.json'),
            content: JSON.stringify({
                owner_chat_id: '',
                task: [
                    { id: 0, time: 'D00:01', task: 'checkItem' },
                    { id: 1, time: 'D00:11', task: 'pullgitdata' },
                    { id: 2, time: 'D23:11', task: 'sendDayPush' },
                    { id: 3, time: 'W3:18:29', task: 'sendWeekPush' },
                ],
            }, null, 2),
        }
    ];

    // 创建文件夹
    for (const folder of folders) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(`✅ 创建文件夹: ${folder}`);
        } else {
            console.log(`📂 已存在文件夹: ${folder}`);
        }
    }

    // 创建文件
    for (const file of files) {
        if (!fs.existsSync(file.path)) {
            fs.writeFileSync(file.path, file.content, 'utf8');
            console.log(`✅ 创建文件: ${file.path}`);
        } else {
            console.log(`📄 已存在文件: ${file.path}`);
        }
    }
}

initInstall()
