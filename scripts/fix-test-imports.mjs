import { promises as fs } from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve(".test-dist");

function needsJsExtension(specifier) {
  return (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    path.extname(specifier) === ""
  );
}

async function rewriteImports(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const updated = source.replace(
    /(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g,
    (match, prefix, specifier, suffix) => {
      if (!needsJsExtension(specifier)) return match;
      return `${prefix}${specifier}.js${suffix}`;
    }
  );

  if (updated !== source) {
    await fs.writeFile(filePath, updated);
  }
}

async function visit(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
        return;
      }
      if (entry.isFile() && fullPath.endsWith(".js")) {
        await rewriteImports(fullPath);
      }
    })
  );
}

await visit(OUTPUT_DIR);
