import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * 提取网页中的 .n-title.pushMessage 和 .pushMessage 信息
 * @param {string} url - 目标网页的 URL
 * @returns {Promise<Array<{title: string, message: string}>>} - 返回提取的信息数组
 */
async function extractPushMessages(urlconf) {
    // 启动浏览器
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 导航到目标网页
    await page.goto(urlconf.url, {
        waitUntil: 'networkidle2'
    });

    // 获取页面内容
    const content = await page.content();

    // 使用 Cheerio 加载页面内容
    const $ = cheerio.load(content);

    // 提取 n-title pushMessage 和对应的 pushMessage 信息
    const messages = [];
    $(urlconf.block).each((index, element) => {
        const title = $(element).find(urlconf.title).text().trim();
        const message = $(element).find(urlconf.pushMessage).text().trim();
        if (title && message) {
            messages.push({
                title: title,
                message: message
            });
        }
    });

    // 关闭浏览器
    await browser.close();

    // 返回提取的信息
    return messages;
}

const urlconfs=[
   {
        url:'https://www.panewslab.com/zh/news/index.html',
        block:'.item',
        title:'.n-title.pushMessage',
        pushMessage:'.pushMessage'
    },
    {
        url:'https://www.theblockbeats.info/newsflash',
        block:'.news-flash-wrapper',
        title:'.news-flash-title-text',
        pushMessage:'.news-flash-item-content'
    }, 
    {
        url:'https://www.odaily.news/newsflash',
        block:'div ._10Kq18pH',
        title:'div.hZVqeSqH',
        pushMessage:'div._27drOVYG'
    }
];

async function getnews() {
   
    try {
        let newgetnewarr=[];
     
        for(let i=0;i<urlconfs.length;i++){
        const arr= await extractPushMessages(urlconfs[i]);
        newgetnewarr.push(...arr)
        }
       return newgetnewarr;
    } catch (error) {
        console.error('Error extracting messages:', error);
    }
}

export {getnews}

// 测试函数
/* (async () => {
   
    try {
       
        let newgetnewarr= await extractPushMessages(urlconfs[0]);

        
        const arr= await extractPushMessages(urlconfs[1]);
        newgetnewarr.push(...arr)
        console.log(JSON.stringify(messages1, null, 2)); // 打印提取的信息
    } catch (error) {
        console.error('Error extracting messages:', error);
    }
})(); */