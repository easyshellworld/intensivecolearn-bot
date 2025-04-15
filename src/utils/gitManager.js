// src/utils/gitManager.js
import fs from 'fs/promises';
import path from 'path';
import { simpleGit } from 'simple-git';

export async function updateRepository(repoInfo, basePath) {
  const repoDir = path.join(basePath, repoInfo.itemname);
  const git = simpleGit();
  try {
    await fs.access(repoDir);
    console.log(`Pulling repo ${repoInfo.itemname}`);
    await git.cwd(repoDir).pull();
  } catch (error) {
    console.log(`Cloning repo ${repoInfo.itemname}`);
    await git.clone(repoInfo.git_url, repoDir);
  }
  return repoDir;
}
