#!/usr/bin/env ts-node

/**
 * Complete SEO Database Setup Script
 * 
 * This script automates the entire SEO system setup:
 * 1. Runs database migrations
 * 2. Imports keywords
 * 3. Imports locations
 * 4. Verifies data
 * 5. Optionally generates initial page cache
 */

import { execSync } from 'child_process';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function runCommand(command: string, description: string) {
  console.log(`\n${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} complete`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    return false;
  }
}

async function askQuestion(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  console.log('🚀 Starting SEO Database Setup...');
  console.log('================================\n');

  // Step 1: Run migrations
  console.log('📦 Step 1: Running database migrations');
  if (!runCommand('npx prisma migrate deploy', 'Database migrations')) {
    console.error('\n❌ Setup failed at migrations step');
    process.exit(1);
  }

  // Step 2: Import keywords
  console.log('\n🔑 Step 2: Importing SEO keywords');
  if (!runCommand('npx ts-node scripts/import-seo-keywords.ts', 'Keyword import')) {
    console.error('\n❌ Setup failed at keyword import step');
    process.exit(1);
  }

  // Step 3: Import locations
  console.log('\n📍 Step 3: Importing SEO locations');
  if (!runCommand('npx ts-node scripts/import-seo-locations.ts', 'Location import')) {
    console.error('\n❌ Setup failed at location import step');
    process.exit(1);
  }

  // Step 4: Verify data
  console.log('\n🔍 Step 4: Verifying imported data');
  runCommand('npx ts-node scripts/test-seo-data.ts', 'Data verification');

  // Step 5: Optional page generation
  console.log('\n📄 Step 5: Generate initial page cache?');
  console.log('This will pre-generate ~5,000 pages and may take 10-30 minutes.');
  console.log('You can skip this and let pages generate on-demand via ISR.\n');

  const shouldGenerate = await askQuestion('Generate now? (y/N): ');
  
  if (shouldGenerate) {
    console.log('\nGenerating pages (this may take a while)...');
    runCommand('npx ts-node scripts/generate-seo-pages.ts', 'Page generation');
  } else {
    console.log('\n⏭️  Skipping page generation (pages will generate on-demand)');
  }

  console.log('\n================================');
  console.log('✅ SEO Database Setup Complete!\n');
  console.log('Next steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test the API: curl http://localhost:3000/seo-pages/keywords/top?limit=5');
  console.log('3. Test a landing page: http://localhost:3001/hair-salon\n');

  rl.close();
}

main().catch((error) => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});
