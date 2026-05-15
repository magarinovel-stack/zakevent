#!/usr/bin/env node
/**
 * ZAKEVENTS Database Migration Runner
 * Applies SQL migrations in order from migrations/ directory.
 * Tracks applied migrations in a `schema_migrations` table.
 *
 * Usage: npm run db:migrate
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

async function ensureMigrationsTable() {
  await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT now()
    );`
  }).then(({ error }) => {
    // If RPC doesn't exist, try direct query via REST — table may already exist
    if (error) console.warn('Note: schema_migrations table may already exist');
  });
}

async function getAppliedMigrations() {
  const { data } = await supabase.from('schema_migrations').select('version').order('version');
  return new Set((data || []).map(r => r.version));
}

async function applyMigration(version, sql) {
  console.log(`  Applying: ${version}...`);
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error(`  ❌ Failed: ${version}`, error.message);
    process.exit(1);
  }
  await supabase.from('schema_migrations').insert({ version });
  console.log(`  ✅ Applied: ${version}`);
}

async function main() {
  console.log('🗄️  ZAKEVENTS Database Migration Runner\n');

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    console.log('Created migrations/ directory');
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const pending = files.filter(f => !applied.has(f));

  if (pending.length === 0) {
    console.log('✅ Database is up to date. No pending migrations.');
    return;
  }

  console.log(`Found ${pending.length} pending migration(s):\n`);
  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    await applyMigration(file, sql);
  }

  console.log(`\n✅ All ${pending.length} migration(s) applied successfully.`);
}

main().catch(err => { console.error('Migration failed:', err); process.exit(1); });
