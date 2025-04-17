// src/resources/getgitdata.js
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { loadConfig, findItemByName } from '../utils/config.js';
import { updateRepository } from '../utils/gitManager.js';
import { parseCommitTable, parseMarkdownNotes, parseTable } from '../utils/markdownParser.js';
import { initDB } from '../utils/dbManager.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GIT_BASE_PATH = path.join(__dirname, '..', '..', 'data', 'githubgit');




async function getgitdata(itemname) {
  const safeItemName = itemname.replace(/-/g, '_');
  const config = await loadConfig();
  const db = initDB(itemname);




  const checkExistsStmt = db.prepare(`
    SELECT 1 FROM ${safeItemName}_notes 
    WHERE repo = ? AND user = ? AND date = ?
  `);
  const insertStmt = db.prepare(`
    INSERT INTO ${safeItemName}_notes (repo, user, date, note)
    VALUES (?, ?, ?, ?)
  `);
  const repoInfo = findItemByName(config, itemname)
  if (repoInfo != null) {
    try {

      const repoDir = await updateRepository(repoInfo, GIT_BASE_PATH);
      const readmePath = path.join(repoDir, 'README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');
      const mdFiles = parseCommitTable(readmeContent);
      console.log(`Parsed markdown files for repo ${repoInfo.itemname}:`, mdFiles);

      for (const mdFile of mdFiles) {
        const mdPath = path.join(repoDir, mdFile);
        try {
          const content = await fs.readFile(mdPath, 'utf-8');
          const notes = parseMarkdownNotes(content);
          for (const { date, noteText } of notes) {

            const user = mdFile.replace('.md', '');
            // 去重检查
            const existing = checkExistsStmt.get(
              repoInfo.itemname,
              user,
              date
            );

            if (!existing && noteText.length > 5) {



              insertStmt.run(
                repoInfo.itemname,
                user,
                date,
                noteText,

              );
              //  console.log(`Inserted new note: ${user}@${repoInfo.itemname} (${date})`);
            } else {
              //  console.log(`Skipped duplicate: ${user}@${repoInfo.itemname} (${date})`);
            }
          }

        } catch (err) {
          console.error(`Error processing markdown file ${mdPath}:`, err);
        }
      }
    } catch (err) {
      console.error(`Error processing repo ${repoInfo.itemname}:`, err);
    }
  }
  /// closeDB(db)
}

async function getdailycheckin(itemname) {
  const safeItemName = itemname.replace(/-/g, '_');
  const config = await loadConfig();
  const db = initDB(safeItemName);
  const repoInfo = findItemByName(config, itemname)
  if (repoInfo != null) {
    try {

      const repoDir = await updateRepository(repoInfo, GIT_BASE_PATH);
      const readmePath = path.join(repoDir, 'README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');
      const result = parseTable(readmeContent);
      // console.log(result)
      const insertStmt = db.prepare(`
        INSERT INTO ${safeItemName}_daily_checkin (user, date, status, is_active)
        VALUES (@user, @date, @status, @is_active)
        ON CONFLICT(user, date) DO UPDATE SET
        status = @status,
        is_active = @is_active
      `);


      const transaction = db.transaction((records) => {
        for (const record of records) {
          insertStmt.run({
            user: record.user,
            date: record.date,
            status: record.status,
            is_active: record.is_active ? 1 : 0
          })
        }
      });

      transaction(result);  // 执行批量插入操作

      console.log('数据已插入！');


    } catch (err) {
      console.error(`Error processing repo ${repoInfo.itemname}:`, err);
    }

  }
}


function getweekdbdata(itemname, day) {
  const safeItemName = itemname.replace(/-/g, '_');
  const db = initDB(safeItemName);

  const StatData = db.prepare(`
      SELECT 
    '${itemname}' AS itemname,
     strftime('%Y.%m.%d', date('now', '-${day} days'))  AS start_date,
     strftime('%Y.%m.%d', date('now'))  AS end_date,
    COUNT(DISTINCT user) AS distinct_user_count,
    COUNT(*) AS total_note_count
FROM ${safeItemName}_notes
WHERE repo = '${itemname}'
    AND date >=strftime('%Y.%m.%d', date('now', '-${day} days')) 
    AND date <= strftime('%Y.%m.%d', date('now'))
    AND LENGTH(note) >= 10;
    `
  )
    .all()

  /*   */
  const notes = db
    .prepare(`
   SELECT user, date, note
    FROM ${safeItemName}_notes
    WHERE  repo = '${itemname}'
      AND date >= strftime('%Y.%m.%d', date('now', '-${day} days')) 
      AND date <= strftime('%Y.%m.%d', date('now'))
      AND LENGTH(note) >= 10
    ORDER BY date DESC; 
  `)
    .all();

  return JSON.stringify(StatData) + JSON.stringify(notes)
}

function getdaydbdata(itemname, day) {
  const safeItemName = itemname.replace(/-/g, '_');
  const db = initDB(safeItemName);
  const daydbdata = db
    .prepare(`
SELECT 
    SUM(CASE WHEN status = '✅' THEN 1 ELSE 0 END) AS completed_checkins,
    SUM(CASE WHEN status = '⭕️' THEN 1 ELSE 0 END) AS vacation_days,
    SUM(CASE WHEN status = '❌' THEN 1 ELSE 0 END) AS eliminated_users,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_users
FROM ${safeItemName}_daily_checkin 
WHERE date = date('now', '-${day} day')
  `)
    .all();

    return daydbdata

}

/* export async function getnewdata(itemname,day){
  await getdailycheckin(itemname)
  await getgitdata(itemname)
  const notesdata=getdbdata(itemname,day)
 return []
 // return notesdata
}
 */

export {
  getdailycheckin,
  getgitdata,
  getweekdbdata,
  getdaydbdata,
}

