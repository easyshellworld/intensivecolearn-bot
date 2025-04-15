// src/resources/getgitdata.js
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { loadConfig,findItemByName } from '../utils/config.js';
import { updateRepository } from '../utils/gitManager.js';
import { parseCommitTable, parseMarkdownNotes } from '../utils/markdownParser.js';
import { initDB } from '../utils/dbManager.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GIT_BASE_PATH = path.join(__dirname, '..', '..', 'data', 'githubgit');
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'datadb', 'notes.db');



async function getgitdata(itemname) {
  const config = await loadConfig();
  const db = initDB(DB_PATH);


 

  const checkExistsStmt = db.prepare(`
    SELECT 1 FROM notes 
    WHERE repo = ? AND user = ? AND date = ?
  `);
  const insertStmt = db.prepare(`
    INSERT INTO notes (repo, user, date, note)
    VALUES (?, ?, ?, ?)
  `);
  const repoInfo=findItemByName(config,itemname)
if(repoInfo!=null){
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

            if (!existing && noteText.length>5 ) {
              
            

              insertStmt.run(
                repoInfo.itemname,
                user,
                date,
                noteText,
                
              );
              console.log(`Inserted new note: ${user}@${repoInfo.itemname} (${date})`);
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

}


function getdbdata(itemname,day){
  const db = initDB(DB_PATH);

  const StatData=db.prepare(`
      SELECT 
    '${itemname}' AS itemname,
     strftime('%Y.%m.%d', date('now', '-${day} days'))  AS start_date,
     strftime('%Y.%m.%d', date('now'))  AS end_date,
    COUNT(DISTINCT user) AS distinct_user_count,
    COUNT(*) AS total_note_count
FROM notes
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
    FROM notes
    WHERE  repo = '${itemname}'
      AND date >= strftime('%Y.%m.%d', date('now', '-${day} days')) 
      AND date <= strftime('%Y.%m.%d', date('now'))
      AND LENGTH(note) >= 10
    ORDER BY date DESC; 
  `)
  .all();

  return JSON.stringify(StatData)+JSON.stringify(notes)
}

export async function getnewdata(itemname,day){
 
  await getgitdata(itemname)
  const notesdata=getdbdata(itemname,day)
  return notesdata
}


// getnewdata("Ethereum-Protocol-Fellowship-3","7")

