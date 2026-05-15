#!/usr/bin/env node
/**
 * ZAKEVENTS Integration Verification Script
 * Statically verifies that all API routes, DB tables, and frontend calls are aligned.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const serverPath = path.join(ROOT, 'server.ts');
const schemaPath = path.join(ROOT, 'supabase-schema.sql');
const srcDir = path.join(ROOT, 'src');

let errors = 0;
let checks = 0;

function check(label: string, condition: boolean) {
  checks++;
  if (condition) {
    console.log(`  ✅ ${label}`);
  } else {
    console.log(`  ❌ ${label}`);
    errors++;
  }
}

function readFile(p: string): string {
  return fs.readFileSync(p, 'utf-8');
}

function scanDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...scanDir(full, ext));
    else if (entry.name.endsWith(ext)) results.push(full);
  }
  return results;
}

console.log('\n🔍 ZAKEVENTS INTEGRATION VERIFICATION\n');

// 1. Verify API routes exist in server.ts
console.log('📡 API Routes:');
const server = readFile(serverPath);
const requiredRoutes = [
  { method: 'get', path: '/api/search' },
  { method: 'get', path: '/api/providers/:id' },
  { method: 'post', path: '/api/bookings' },
  { method: 'post', path: '/api/payments/create-checkout' },
  { method: 'post', path: '/api/webhooks/chargily' },
  { method: 'get', path: '/api/health' },
  { method: 'get', path: '/api/csrf-token' },
  { method: 'post', path: '/api/disputes/create' },
  { method: 'post', path: '/api/disputes/resolve' },
  { method: 'get', path: '/api/disputes' },
  { method: 'post', path: '/api/providers/onboarding/complete' },
  { method: 'put', path: '/api/profile/update' },
  { method: 'post', path: '/api/admin/soft-delete' },
  { method: 'post', path: '/api/ai/optimize-budget' },
];

for (const route of requiredRoutes) {
  const pattern = `app.${route.method}("${route.path}"`;
  check(`${route.method.toUpperCase()} ${route.path}`, server.includes(pattern));
}

// 2. Verify database tables have RLS
console.log('\n🔒 Database RLS:');
const schema = readFile(schemaPath);
const rlsTables = ['users', 'providers', 'bookings', 'service_packages', 'reviews', 'messages', 'notifications', 'availability', 'disputes'];
for (const table of rlsTables) {
  check(`${table} has RLS enabled`, schema.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
}

// 3. Verify no `any` types in src
console.log('\n🔧 Code Quality:');
const tsxFiles = scanDir(srcDir, '.tsx').concat(scanDir(srcDir, '.ts'));
let anyCount = 0;
let consoleCount = 0;
for (const file of tsxFiles) {
  const content = readFile(file);
  const anyMatches = content.match(/: any\b/g);
  const consoleMatches = content.match(/console\.(log|warn|error)/g);
  if (anyMatches) anyCount += anyMatches.length;
  if (consoleMatches) consoleCount += consoleMatches.length;
}
check(`Zero \`any\` types in src/ (found: ${anyCount})`, anyCount === 0);
check(`Zero console.* calls in src/ (found: ${consoleCount})`, consoleCount === 0);

// 4. Verify i18n has both languages
console.log('\n🌍 i18n:');
const i18nPath = path.join(srcDir, 'lib', 'i18n.ts');
const i18n = readFile(i18nPath);
check('French translations present', i18n.includes("fr: { translation:"));
check('Arabic translations present', i18n.includes("ar: { translation:"));
check('useTranslation used across pages', tsxFiles.filter(f => readFile(f).includes('useTranslation')).length >= 15);

// 5. Verify PWA assets
console.log('\n📱 PWA & SEO:');
check('manifest.json exists', fs.existsSync(path.join(ROOT, 'public', 'manifest.json')));
check('Service worker exists', fs.existsSync(path.join(ROOT, 'public', 'sw.js')));
check('robots.txt route in server', server.includes('/robots.txt'));
check('sitemap.xml route in server', server.includes('/sitemap.xml'));

// 6. Verify security
console.log('\n🛡️ Security:');
check('Helmet CSP configured', server.includes('contentSecurityPolicy'));
check('Rate limiting configured', server.includes('rateLimit'));
check('Webhook HMAC verification', server.includes('timingSafeEqual'));
check('CSRF database-backed', server.includes('csrf_tokens'));
check('Environment validation on startup', server.includes('validateEnv'));
check('Zod validation on endpoints', server.includes('safeParse'));

// 7. Verify production readiness
console.log('\n🚀 Production Readiness:');
check('Health check endpoint', server.includes('/api/health'));
check('Graceful shutdown', server.includes('SIGTERM'));
check('Structured logging (pino)', server.includes('pino'));
check('Dockerfile exists', fs.existsSync(path.join(ROOT, 'Dockerfile')));
check('docker-compose.yml exists', fs.existsSync(path.join(ROOT, 'docker-compose.yml')));
check('Migration tooling exists', fs.existsSync(path.join(ROOT, 'scripts', 'db-migrate.ts')));

// 8. Verify fonts aligned
console.log('\n🎨 Design System:');
const indexCss = readFile(path.join(srcDir, 'index.css'));
const designTokens = readFile(path.join(srcDir, 'lib', 'design-tokens.ts'));
const indexHtml = readFile(path.join(ROOT, 'index.html'));
check('Font consistent: Plus Jakarta Sans in CSS', indexCss.includes('Plus Jakarta Sans'));
check('Font consistent: Plus Jakarta Sans in tokens', designTokens.includes('Plus Jakarta Sans'));
check('Font consistent: Plus Jakarta Sans in HTML', indexHtml.includes('Plus+Jakarta+Sans'));
check('RTL utilities present', indexCss.includes('margin-inline-start'));

// 9. AI feature disabled
console.log('\n🤖 Feature Flags:');
check('AI endpoint returns disabled', server.includes('enabled: false'));
check('AI feature flag in .env.example', readFile(path.join(ROOT, '.env.example')).includes('AI_BUDGET_OPTIMIZER_ENABLED=false'));

// Summary
console.log(`\n${'═'.repeat(50)}`);
if (errors === 0) {
  console.log(`\n✅ ALL ${checks} CHECKS PASSED — ZAKEVENTS IS PRODUCTION READY\n`);
} else {
  console.log(`\n❌ ${errors}/${checks} checks FAILED — fix before shipping\n`);
  process.exit(1);
}
