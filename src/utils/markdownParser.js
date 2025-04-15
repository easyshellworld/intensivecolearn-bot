// src/utils/markdownParser.js
export function parseCommitTable(readmeContent) {
    const tableMatch = readmeContent.match(/<!-- START_COMMIT_TABLE -->([\s\S]*?)<!-- END_COMMIT_TABLE -->/);
    if (!tableMatch) return [];
    const tableContent = tableMatch[1];
    const lines = tableContent.split('\n').filter(line => line.trim().startsWith('|') && line.includes('.md'));
    const mdFiles = new Set();
    for (const line of lines) {
      const match = line.match(/\[.*?\]\([^)]+\/([^)]+\.md)\)/);
      if (match) mdFiles.add(match[1]);
    }
    return Array.from(mdFiles);
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
  