import fs from 'fs/promises';
import path from 'path';

const buildDir = path.resolve('build/client');

async function pathExists(filePath: string): Promise<boolean> {
    try {
        await fs.stat(filePath);
        return true; // Path exists (it's a file or directory)
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return false; // Path does not exist
        }
        throw error; // Other errors (e.g., permissions) should be thrown
    }
}

async function createCleanUrls(directory: string) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (!entry.isDirectory())
            continue; // Skip files, only process directories

        // Recurse into subdirectories first
        await createCleanUrls(fullPath);

        const indexPath = path.join(fullPath, 'index.html');
        if (!await pathExists(indexPath))
            continue;

        // If there are no other files in the directory, we can bump it up to the parent directory
        if ((await fs.readdir(fullPath)).length !== 1)
            continue;

        // First move to temp file, then remove the directory, then rename it back to the directory name
        var tmpDir = await fs.mkdtemp("trolleyman-");
        try
        {
            var tmpFile = path.join(tmpDir, 'index.html');
            await fs.rename(indexPath, tmpFile);
            await fs.rmdir(fullPath);
            await fs.rename(tmpFile, fullPath);
            console.log(`Moved ${indexPath} to ${fullPath}`);
        }
        finally
        {
            try
            {
                await fs.rm(tmpDir, { recursive: true });
            }
            catch
            {
            }
        }
    }
}

console.log('Running postbuild script to create clean URLs...');
await createCleanUrls(buildDir);
console.log('Postbuild script finished.');
