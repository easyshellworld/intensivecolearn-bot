// src/utils/markdownParser.js

function gettableMatch(readmeContent){
  const tableMatch = readmeContent.match(/<!-- START_COMMIT_TABLE -->([\s\S]*?)<!-- END_COMMIT_TABLE -->/);
  if (!tableMatch) return [];
  return tableMatch[1];
}

export function parseCommitTable(readmeContent) {
   
    const tableContent = gettableMatch(readmeContent);
    if (!tableContent) return [];

    const lines = tableContent.split('\n').filter(line => line.trim().startsWith('|') && line.includes('.md'));
    const mdFiles = new Set();
    for (const line of lines) {
      const match = line.match(/\[.*?\]\([^)]+\/([^)]+\.md)\)/);
      if (match) mdFiles.add(match[1]);
    }
    return Array.from(mdFiles);
  }

  export function parseTable(readmeContent){
    const tableContent = gettableMatch(readmeContent);
    if (!tableContent) return [];
    
   const dates = [];
  for (let day = 10; day <= 31; day++) {
    dates.push(`3.${day}`);
  }
  for (let day = 1; day <= 20; day++) {
    dates.push(`4.${String(day).padStart(2, '0')}`);
  }
  
  // Split the content into lines
  const lines = tableContent.trim().split('\n');
  
  const result = [];
  const currentYear = new Date().getFullYear();
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('| ---') || !line.includes('|')) continue;
    
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    
    // Extract username from markdown link if present
    const userCell = cells[0];
    const match = userCell.match(/\[(.*?)\]/);
    const username = match ? match[1] : userCell;
    
    // Process status cells
    const statusCells = cells.slice(1);
    
    statusCells.forEach((status, idx) => {
      if (!['✅', '⭕️', '❌', ''].includes(status)) return;
      if (status === '') return; // Skip empty cells
      
      if (idx < dates.length) {
        const dateStr = dates[idx];
        const [month, day] = dateStr.split('.');
        const formattedDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        result.push({
          user: username,
          date: formattedDate,
          status,
          is_active: status !== '❌'
        });
      }
    });
  }
  
  return result;
  }


  
  export function parseMarkdownNotes(content) {
    const match = content.match(/<!-- Content_START -->([\s\S]*?)<!-- Content_END -->/);
    if (!match) return [];
    const notesBlock = match[1];
    const noteEntries = [];
    const regex = /###\s*(\d{4}\.\d{1,2}\.\d{1,2})\s*\n([\s\S]*?)(?=###\s*\d{4}\.\d{1,2}\.\d{1,2}|$)/g;
    let m;
    while ((m = regex.exec(notesBlock)) !== null) {
      noteEntries.push({ date: m[1].trim(), noteText: m[2].trim() });
    }
    return noteEntries;
  }
  