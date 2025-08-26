import fs from 'fs/promises';
import path from 'path';

const buildDir = path.resolve('build/client');

async function pathExists(filePath: string): Promise<boolean> {
    try {
        await fs.stat(filePath);
        return true;
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'ENOENT') {
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

async function moveIndexFiles(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const childDir = path.join(directory, entry.name);
        // Recurse first so we handle deeper trees before collapsing current level
        await moveIndexFiles(childDir);

        const indexPath = path.join(childDir, 'index.html');
        const targetPath = path.join(directory, `${entry.name}.html`);

        if (!(await pathExists(indexPath))) continue;

        // If target exists, remove it so rename won't fail
        await ensureRemoved(targetPath);

        await fs.rename(indexPath, targetPath);
        console.log(`Moved ${indexPath} -> ${targetPath}`);

        // After moving, remove directory if now empty
        const remaining = await fs.readdir(childDir);
        if (remaining.length === 0) {
            await fs.rmdir(childDir);
            console.log(`Removed empty directory ${childDir}`);
        }
    }
}

console.log('Running postbuild script: flatten index.html to sibling .html files...');
await moveIndexFiles(buildDir);
console.log('Postbuild script finished.');
