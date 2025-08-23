import { generateRoutesJson } from "./generateRoutesJsonPlugin.ts";
import { fileURLToPath } from "url";
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    await generateRoutesJson(path.resolve(__dirname, ".."));
}

main().catch(err => {
    console.error("Failed to generate routes.json:", err);
    process.exit(1);
});
