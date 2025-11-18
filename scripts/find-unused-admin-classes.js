const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ADMIN_CSS_DIR = path.join(ROOT, 'assets', 'css', 'admin');
const SEARCH_EXTS = new Set(['.html', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.md']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);

function readFilesRecursively(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const relative = path.relative(ROOT, fullPath).replace(/\\/g, '/');
      if (IGNORE_DIRS.has(relative) || IGNORE_DIRS.has(entry.name)) continue;
      if (fullPath.startsWith(ADMIN_CSS_DIR)) continue;
      files.push(...readFilesRecursively(fullPath));
    } else {
      const ext = path.extname(entry.name);
      if (SEARCH_EXTS.has(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function collectAdminClasses() {
  const classMap = new Map();
  const files = fs.readdirSync(ADMIN_CSS_DIR).filter((file) => file.endsWith('.css'));
  const classRegex = /\.[a-zA-Z][a-zA-Z0-9_-]*/g;

  files.forEach((file) => {
    const filePath = path.join(ADMIN_CSS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(classRegex) || [];
    matches.forEach((match) => {
      const name = match.slice(1);
      if (!classMap.has(name)) {
        classMap.set(name, new Set());
      }
      classMap.get(name).add(filePath);
    });
  });

  return classMap;
}

function findUnusedClasses() {
  const classMap = collectAdminClasses();
  const searchFiles = readFilesRecursively(ROOT).filter((file) => !file.startsWith(ADMIN_CSS_DIR));

  const usage = new Map();
  classMap.forEach((_, className) => usage.set(className, new Set()));

  searchFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    usage.forEach((value, className) => {
      if (content.includes(className)) {
        value.add(filePath);
      }
    });
  });

  const unused = [];
  usage.forEach((value, className) => {
    if (value.size === 0) {
      unused.push({ className, files: Array.from(classMap.get(className)) });
    }
  });

  unused.sort((a, b) => a.className.localeCompare(b.className));
  return unused;
}

const unused = findUnusedClasses();
if (!unused.length) {
  console.log('No unused classes detected.');
} else {
  console.log(`Found ${unused.length} unused classes:`);
  unused.forEach((item) => {
    console.log(`- .${item.className} (${item.files.map((file) => path.relative(ROOT, file)).join(', ')})`);
  });
}
