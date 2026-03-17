import fs from 'fs/promises';
import path from 'path';

const buildDir = path.resolve('build/client');
const serverBuildDir = path.resolve('build/server');
const projectRoot = process.cwd();

// Check if output is going to a terminal
const isTerminal = process.stdout.isTTY;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return isTerminal ? `${colors[color]}${text}${colors.reset}` : text;
}

function getRelativePath(absolutePath: string): string {
  return path.relative(projectRoot, absolutePath);
}

function formatPath(path: string): string {
  return colorize(path, 'cyan');
}

function formatAction(action: string): string {
  return colorize(action, 'green');
}

function formatSuccess(message: string): string {
  return colorize(`✓ ${message}`, 'green');
}

function formatInfo(message: string): string {
  return colorize(`ℹ ${message}`, 'blue');
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'ENOENT'
    ) {
      return false;
    }
    throw error;
  }
}

async function ensureRemoved(filePath: string): Promise<void> {
  if (await pathExists(filePath)) {
    await fs.rm(filePath, { recursive: true, force: true });
  }
}

async function moveIndexFiles(
  directory: string,
): Promise<{ moved: number; removed: number }> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  let moved = 0;
  let removed = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const childDir = path.join(directory, entry.name);
    // Recurse first so we handle deeper trees before collapsing current level
    const childStats = await moveIndexFiles(childDir);
    moved += childStats.moved;
    removed += childStats.removed;

    const indexPath = path.join(childDir, 'index.html');
    const targetPath = path.join(directory, `${entry.name}.html`);

    if (!(await pathExists(indexPath))) continue;

    // If target exists, remove it so rename won't fail
    await ensureRemoved(targetPath);

    await fs.rename(indexPath, targetPath);
    const relativeFrom = formatPath(getRelativePath(indexPath));
    const relativeTo = formatPath(getRelativePath(targetPath));
    console.log(`  ${formatAction('Moved')} ${relativeFrom} → ${relativeTo}`);
    moved++;

    // After moving, remove directory if now empty
    const remaining = await fs.readdir(childDir);
    if (remaining.length === 0) {
      await fs.rmdir(childDir);
      const relativeDir = formatPath(getRelativePath(childDir));
      console.log(
        `  ${formatAction('Removed')} empty directory ${relativeDir}`,
      );
      removed++;
    }
  }

  return { moved, removed };
}

async function copyServerEntry(): Promise<void> {
  const target = path.join(serverBuildDir, 'index.js');
  if (await pathExists(target)) return;

  const entries = await fs.readdir(serverBuildDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(serverBuildDir, entry.name, 'index.js');
    if (await pathExists(candidate)) {
      await fs.copyFile(candidate, target);
      console.log(
        `  ${formatAction('Copied')} ${formatPath(getRelativePath(candidate))} → ${formatPath(getRelativePath(target))}`,
      );
      return;
    }
  }
}

// Main execution
console.log();
console.log(colorize('┌─ Post-build Script', 'bright'));
console.log(
  colorize('│', 'bright') +
    ' Flattening index.html files to sibling .html files...',
);
console.log(colorize('└─', 'bright'));

const startTime = Date.now();
await copyServerEntry();
const stats = await moveIndexFiles(buildDir);
const duration = Date.now() - startTime;

console.log();
console.log(colorize('┌─ Summary', 'bright'));
console.log(
  `│  ${formatSuccess(`Moved ${stats.moved} file${stats.moved !== 1 ? 's' : ''}`)}`,
);
console.log(
  `│  ${formatSuccess(`Removed ${stats.removed} empty director${stats.removed !== 1 ? 'ies' : 'y'}`)}`,
);
console.log(`│  ${formatInfo(`Completed in ${duration}ms`)}`);
console.log(colorize('└─', 'bright'));
console.log();
