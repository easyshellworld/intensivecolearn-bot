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

  export function parseTable(readmeContent) {
  const tableContent = gettableMatch(readmeContent);
  if (!tableContent) return [];

  // Split the content into lines
  const lines = tableContent.trim().split('\n');
  if (lines.length < 2) return [];

  // 提取日期行（假设第一行为表头）
  const headerLine = lines[0];
  const dateCells = headerLine
    .split('|')
    .map(cell => cell.trim())
    .slice(1) // 去掉 Name 列
    .filter(cell => /\d+\.\d+/.test(cell)); // 确保是日期格式

  const result = [];
  const currentYear = new Date().getFullYear();

  // 遍历数据行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('| ---') || !line.includes('|')) continue;

    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;

    // 提取用户名
    const userCell = cells[0];
    const match = userCell.match(/\[(.*?)\]/);
    const username = match ? match[1] : userCell;

    // 处理状态单元格
    const statusCells = cells.slice(1);

    statusCells.forEach((status, idx) => {
      if (!['✅', '⭕️', '❌', ''].includes(status)) return;
      if (status === '' || idx >= dateCells.length) return;

      const dateStr = dateCells[idx];
      const [month, day] = dateStr.split('.');
      const formattedDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      result.push({
        user: username,
        date: formattedDate,
        status,
        is_active: status !== '❌'
      });
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
  