const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'assets', 'css', 'admin.css');
const BASE_DIR = path.join(__dirname, '..', 'assets', 'css');
const SECTION_MARKER = '/* -----------------------------------------------';

const sectionToFile = {
  GLOBAL: 'admin/base.css',
  'Login screen': 'admin/auth.css',
  'Dashboard layout': 'admin/dashboard.css',
  'Editor layout with sidebar': 'admin/editor.css',
  'Responsive tweaks': 'admin/responsive.css'
};

const fileHeaders = {
  'admin/base.css': '/* ============================================================================\n   Admin Base\n   Shared layout scaffolding, typography, utilities\n   ============================================================================ */\n\n',
  'admin/auth.css': '/* ============================================================================\n   Admin Auth\n   Login/onboarding flows and supporting UI\n   ============================================================================ */\n\n',
  'admin/dashboard.css': '/* ============================================================================\n   Admin Dashboard\n   Shell layout, sidebar, cards, and activity modules\n   ============================================================================ */\n\n',
  'admin/editor.css': '/* ============================================================================\n   Admin Editors\n   Live editor layout, forms, and content panes\n   ============================================================================ */\n\n',
  'admin/responsive.css': '/* ============================================================================\n   Admin Responsive\n   Breakpoint-specific adjustments and utilities\n   ============================================================================ */\n\n'
};

const content = fs.readFileSync(SOURCE, 'utf8');
const lines = content.split(/\r?\n/);

const segments = [];
let current = { title: 'GLOBAL', lines: [] };

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (line.startsWith(SECTION_MARKER)) {
    if (current.lines.length) {
      segments.push(current);
    }

    const titleRaw = (lines[i + 1] || '').replace(/[/*-]/g, '').trim();
    const title = titleRaw || 'UNTITLED';
    const closingLine = lines[i + 2] || '';
    const headerLines = [line, lines[i + 1] || '', closingLine].filter(Boolean);

    current = { title, lines: headerLines };
    i += 2;
  } else {
    current.lines.push(line);
  }
}

if (current.lines.length) {
  segments.push(current);
}

const buffers = {};
Object.keys(sectionToFile).forEach((section) => {
  const target = sectionToFile[section];
  if (!buffers[target]) {
    buffers[target] = fileHeaders[target] || '';
  }
});

const unmatched = [];

segments.forEach((segment) => {
  const target = sectionToFile[segment.title];
  if (!target) {
    unmatched.push(segment.title);
    return;
  }

  if (!buffers[target]) {
    buffers[target] = '';
  }

  buffers[target] += `${segment.lines.join('\n').trimEnd()}\n\n`;
});

Object.entries(buffers).forEach(([relativePath, data]) => {
  const fullPath = path.join(BASE_DIR, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, data.trimEnd() + '\n');
});

if (unmatched.length) {
  console.log('Unmatched sections:', [...new Set(unmatched)].join(', '));
} else {
  console.log('All admin sections mapped successfully.');
}
