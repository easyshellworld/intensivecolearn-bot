import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * 提取 Discourse 风格 LXDAO 论坛页面的主题信息，包括标题、链接、板块、最后更新时间，并标记最近更新
 * @param {string} url - 目标论坛页面 URL
 * @param {number} recentHours - 定义“最近更新”的时间阈值（小时）
 * @returns {Promise<Array<{ title: string, link: string, category: string, lastUpdated: string, isRecent: boolean }>>}
 */
async function extractForumTopics(url, recentHours = 24) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/114.0.0.0 Safari/537.36'
  );
  await page.goto(url, { waitUntil: 'networkidle2' ,timeout: 60000});

  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  const now = Date.now();
  const msThreshold = recentHours * 60 * 60 * 1000;

  const topics = [];
  $('tr.topic-list-item').each((_, row) => {
    const $row = $(row);
    // 标题链接选择器
    const $titleEl = $row.find('td.main-link a.title, td.main-link a.topic-link').first();
    // 板块名选择器：Discourse badge 分类
    const $categoryEl = $row.find('span.badge-category__name').first();
    // 更新时间选择器
    const $timeEl = $row.find('span.relative-date').first();

    const title = $titleEl.text().trim() || '';
    let link = $titleEl.attr('href') || '';
    if (link && link.startsWith('/')) {
      link = new URL(link, url).href;
    }
    const category = $categoryEl.text().trim() || '';
    const lastUpdated = $timeEl.attr('title') || $timeEl.text() || '';

    let isRecent = false;
    if (lastUpdated) {
      const date = new Date(lastUpdated);
      if (!isNaN(date)) {
        isRecent = (now - date.getTime()) <= msThreshold;
      }
    }

    topics.push({ title, link, category, lastUpdated, isRecent });
  });

  return topics;
}


async function getforumdata(){
  try {
    const forumUrl = 'https://forum.lxdao.io/';
    const topics = await extractForumTopics(forumUrl, 24);
    return topics
  } catch (err) {
    console.error('抓取论坛信息时出错：', err);
    return []
  }

}

export {
  getforumdata
}
/* // 示例执行
(async () => {
  try {
    const forumUrl = 'https://forum.lxdao.io/';
    const topics = await extractForumTopics(forumUrl, 24);
    console.log(JSON.stringify(topics, null, 2));
  } catch (err) {
    console.error('抓取论坛信息时出错：', err);
  }
})(); */


