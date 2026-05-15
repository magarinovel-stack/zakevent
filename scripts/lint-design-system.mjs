#!/usr/bin/env node
/**
 * ZAKEVENTS Design System Lint — ZERO DRIFT ENFORCER
 * Detects: hardcoded colors, Tailwind color utilities, non-token shadows,
 * forbidden radii, and inline styles.
 * Run: node scripts/lint-design-system.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = join(import.meta.dirname, '..', 'src');
const EXTENSIONS = ['.tsx', '.ts'];
const IGNORE_DIRS = ['node_modules', 'dist', '.git'];
const IGNORE_FILES = ['design-tokens.ts', 'index.css', 'utils.ts', 'types.ts', 'i18n.ts', 'store.ts', 'constants.ts'];

// DS component files are allowed to use raw tokens
const DS_FILES = ['ui/button.tsx', 'ui/card.tsx', 'ui/modal.tsx', 'ui/table.tsx',
  'ui/timeline.tsx', 'ui/chart-wrapper.tsx', 'ui/page-container.tsx',
  'ui/section-heading.tsx', 'ui/index.ts', 'ui/badge.tsx', 'ui/sonner.tsx'];

// Allowed hex colors
const ALLOWED_COLORS = new Set([
  '#C49A3C', '#D4B060', '#A67E2E', '#1C1C1E', '#2C2C2E',
  '#FAF8F4', '#F5F2EC', '#D4816A', '#6A9E7F', '#B85C4A',
  '#6B7280', '#E8E4DC', '#FFFFFF',
]);

// Forbidden: Tailwind color utilities (bg-red-500, text-gray-100, border-blue-200, etc.)
const TAILWIND_COLOR_RE = /(?:bg|text|border|ring|outline|fill|stroke|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/;

// Forbidden: Tailwind shadow utilities (should use shadow-[var(--shadow-*)])
// Must not match shadow-[var(--shadow-sm)] etc.
const TAILWIND_SHADOW_RE = /\bshadow-(sm|md|lg|xl|2xl|inner)\b(?![)\]])/;

// Forbidden: Tailwind radius classes (should use rounded-[var(--radius-*)])
// Exception: rounded-full is allowed for circles/pills, rounded-none is allowed for overrides
// rounded-sm is allowed (used in tooltip arrows etc. where 2px is intentional)
const TAILWIND_RADIUS_RE = /\brounded-(md|lg|xl|2xl|3xl)\b(?![)\]])/;

// Hardcoded hex in className strings
const HEX_IN_CLASS = /#[0-9a-fA-F]{3,8}/g;

// Inline style= usage
const INLINE_STYLE = /style=\{/;

function getFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...getFiles(full));
    } else if (EXTENSIONS.some(ext => entry.endsWith(ext)) && !IGNORE_FILES.includes(entry)) {
      results.push(full);
    }
  }
  return results;
}

function isDsIgnored(line) {
  return line.includes('ds-ignore');
}

let totalViolations = 0;
const violations = [];

const allFiles = getFiles(join(SRC_DIR, 'pages'))
  .concat(getFiles(join(SRC_DIR, 'components')))
  .concat(getFiles(join(SRC_DIR, 'lib')));

for (const file of allFiles) {
  const rel = relative(SRC_DIR, file);
  if (DS_FILES.some(f => rel.includes(f))) continue;
  if (IGNORE_FILES.includes(rel.split('/').pop())) continue;

  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    if (isDsIgnored(line)) return;

    // 1. Hardcoded hex colors
    const hexMatches = line.match(HEX_IN_CLASS);
    if (hexMatches) {
      for (const hex of hexMatches) {
        if (!ALLOWED_COLORS.has(hex.toUpperCase())) {
          violations.push({ file: rel, line: lineNum, rule: 'no-hardcoded-color', value: hex });
          totalViolations++;
        }
      }
    }

    // 2. Tailwind color utilities
    const colorMatch = line.match(TAILWIND_COLOR_RE);
    if (colorMatch) {
      violations.push({ file: rel, line: lineNum, rule: 'no-tailwind-color', value: colorMatch[0] });
      totalViolations++;
    }

    // 3. Tailwind shadow utilities
    const shadowMatch = line.match(TAILWIND_SHADOW_RE);
    if (shadowMatch) {
      violations.push({ file: rel, line: lineNum, rule: 'no-tailwind-shadow', value: shadowMatch[0] });
      totalViolations++;
    }

    // 4. Tailwind radius classes (not rounded-full or rounded-none)
    const radiusMatch = line.match(TAILWIND_RADIUS_RE);
    if (radiusMatch) {
      violations.push({ file: rel, line: lineNum, rule: 'no-tailwind-radius', value: radiusMatch[0] });
      totalViolations++;
    }

    // 5. Inline styles
    if (INLINE_STYLE.test(line)) {
      violations.push({ file: rel, line: lineNum, rule: 'no-inline-style', value: 'style={...}' });
      totalViolations++;
    }
  });
}

// Output
console.log('\n═══════════════════════════════════════════════════');
console.log('  ZAKEVENTS Design System Lint Report');
console.log('═══════════════════════════════════════════════════\n');

if (violations.length === 0) {
  console.log('✅ ZERO VIOLATIONS. ONE SYSTEM. ZERO DRIFT.\n');
  process.exit(0);
}

const byFile = {};
for (const v of violations) {
  if (!byFile[v.file]) byFile[v.file] = [];
  byFile[v.file].push(v);
}

for (const [file, fileViolations] of Object.entries(byFile)) {
  console.log(`\n📄 ${file} (${fileViolations.length} violations)`);
  for (const v of fileViolations.slice(0, 8)) {
    console.log(`   L${v.line}: [${v.rule}] ${v.value}`);
  }
  if (fileViolations.length > 8) {
    console.log(`   ... and ${fileViolations.length - 8} more`);
  }
}

console.log(`\n═══════════════════════════════════════════════════`);
console.log(`  TOTAL: ${totalViolations} violations across ${Object.keys(byFile).length} files`);
console.log(`═══════════════════════════════════════════════════`);
console.log(`\n  Rules:`);
console.log(`  • no-tailwind-color: Use var(--color-*) tokens, not bg-gray-100`);
console.log(`  • no-tailwind-shadow: Use shadow-[var(--shadow-*)] tokens`);
console.log(`  • no-tailwind-radius: Use rounded-[var(--radius-*)] tokens`);
console.log(`  • no-hardcoded-color: Use var(--color-*) CSS variables`);
console.log(`  • no-inline-style: Use Tailwind utilities`);
console.log(`  Suppress: Add // ds-ignore comment for intentional exceptions.\n`);

process.exit(1);
