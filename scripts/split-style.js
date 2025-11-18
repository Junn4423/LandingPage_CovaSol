const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'assets', 'css', 'style.css');
const BASE_DIR = path.join(__dirname, '..', 'assets', 'css');

const sectionToFile = {
  'LOADING SCREEN': 'landing/layout-shell.css',
  'NAVIGATION': 'landing/layout-shell.css',
  'HERO SECTION': 'landing/hero.css',
  'VIETNAMESE TYPOGRAPHY OPTIMIZATION': 'landing/layout-shell.css',
  'PAGE HERO STYLES (Products, Blog)': 'landing/layout-shell.css',
  'PRODUCTS PAGE STYLES': 'landing/products.css',
  'BLOG PAGE STYLES': 'landing/blog.css',
  'SECTIONS': 'landing/home-sections.css',
  'SERVICES SECTION': 'landing/home-sections.css',
  'SERVICE DETAIL SECTION': 'landing/home-sections.css',
  'ABOUT SECTION': 'landing/home-sections.css',
  'WHY CHOOSE SECTION': 'landing/home-sections.css',
  'CUSTOMER REVIEWS SECTION': 'landing/home-sections.css',
  'CONTACT SECTION': 'landing/home-sections.css',
  'CONTACT FORM': 'landing/home-sections.css',
  'FOOTER': 'landing/layout-shell.css',
  'BACK TO TOP BUTTON': 'landing/layout-shell.css',
  'RESPONSIVE DESIGN': 'landing/responsive.css',
  'CUSTOM ANIMATIONS': 'landing/responsive.css',
  'MOBILE UTILITIES & TOUCH IMPROVEMENTS': 'landing/responsive.css'
};

const fileHeaders = {
  'landing/layout-shell.css': '/* ============================================================================\n   Layout Shell\n   Navigation, loading, page hero, footer, and shared layout pieces\n   ============================================================================ */\n\n',
  'landing/hero.css': '/* ============================================================================\n   Hero Section\n   Primary hero module and related visual treatments\n   ============================================================================ */\n\n',
  'landing/home-sections.css': '/* ============================================================================\n   Home Sections\n   Services, about, reviews, contact, and supporting blocks\n   ============================================================================ */\n\n',
  'landing/products.css': '/* ============================================================================\n   Products Listing\n   Product grid, cards, and CTAs\n   ============================================================================ */\n\n',
  'landing/blog.css': '/* ============================================================================\n   Blog Listing\n   Featured posts, categories, cards, and async states\n   ============================================================================ */\n\n',
  'landing/responsive.css': '/* ============================================================================\n   Responsive & Motion\n   Media queries, animations, and touch-specific adjustments\n   ============================================================================ */\n\n'
};

const content = fs.readFileSync(SOURCE, 'utf8');
const lines = content.split(/\r?\n/);

const segments = [];
let current = { title: 'INTRO', lines: [] };

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (line.startsWith('/* ============================================================================')) {
    const titleLine = (lines[i + 1] || '').replace(/[\/*]/g, '').trim();
    const closingLine = lines[i + 2] || '';

    // finalize current segment if it has content
    if (current.lines.length) {
      segments.push(current);
    }

    const headerLines = [line, lines[i + 1] || '', closingLine];
    current = { title: titleLine || 'UNTITLED', lines: headerLines.filter(Boolean) };
    i += 2; // skip the title + closing lines we already captured
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
  fs.writeFileSync(fullPath, data.trimEnd() + '\n');
});

if (unmatched.length) {
  console.log('Unmatched sections:', [...new Set(unmatched)].join(', '));
} else {
  console.log('All sections mapped successfully.');
}
