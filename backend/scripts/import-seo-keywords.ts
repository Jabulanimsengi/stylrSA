import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface KeywordData {
  keyword: string;
  category: string;
  priority: number;
}

function generateSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function parseKeywordFile(filePath: string): KeywordData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const keywords: KeywordData[] = [];
  let currentCategory = '';
  let keywordNumber = 0;
  
  console.log(`Parsing ${lines.length} lines from file`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim(); // Trim whitespace including \r
    
    // Match category headers like "## Hair Salon Keywords (1-100)"
    const categoryMatch = line.match(/^##\s+(.+?)\s+Keywords\s+\((\d+)-(\d+)\)/i);
    if (categoryMatch) {
      currentCategory = categoryMatch[1];
      console.log(`Found category: ${currentCategory}`);
      continue;
    }
    
    // Match keyword lines like "1. hair salon near me"
    const keywordMatch = line.match(/^\d+\.\s+(.+)$/);
    if (keywordMatch) {
      keywordNumber++;
      const keyword = keywordMatch[1].trim();
      
      // Use a default category if none is set yet
      if (!currentCategory) {
        currentCategory = 'General';
      }
      
      // Assign priority based on keyword position
      // Tier 1 (Priority 1): Keywords 1-600 (most important)
      // Tier 2 (Priority 2): Keywords 601-900
      // Tier 3 (Priority 3): Keywords 901-1000
      let priority = 3;
      if (keywordNumber <= 600) {
        priority = 1;
      } else if (keywordNumber <= 900) {
        priority = 2;
      }
      
      keywords.push({
        keyword,
        category: currentCategory,
        priority,
      });
      
      if (keywordNumber <= 5) {
        console.log(`Keyword ${keywordNumber}: ${keyword} (${currentCategory})`);
      }
    }
  }
  
  console.log(`Total keywords parsed: ${keywords.length}`);
  return keywords;
}

async function importKeywords() {
  console.log('Starting SEO keyword import...');
  
  try {
    // Parse both keyword files
    const specsDir = path.join(__dirname, '../../.kiro/specs/seo-optimization');
    const comprehensiveFile = path.join(specsDir, 'comprehensive-keywords.md');
    const continuedFile = path.join(specsDir, 'keywords-continued.md');
    
    console.log(`Looking for files in: ${specsDir}`);
    console.log(`Comprehensive file exists: ${fs.existsSync(comprehensiveFile)}`);
    console.log(`Continued file exists: ${fs.existsSync(continuedFile)}`);
    
    let allKeywords: KeywordData[] = [];
    
    if (fs.existsSync(comprehensiveFile)) {
      console.log('Parsing comprehensive-keywords.md...');
      const keywords1 = parseKeywordFile(comprehensiveFile);
      allKeywords = allKeywords.concat(keywords1);
      console.log(`Found ${keywords1.length} keywords in comprehensive-keywords.md`);
    } else {
      console.log('comprehensive-keywords.md not found!');
    }
    
    if (fs.existsSync(continuedFile)) {
      console.log('Parsing keywords-continued.md...');
      const keywords2 = parseKeywordFile(continuedFile);
      allKeywords = allKeywords.concat(keywords2);
      console.log(`Found ${keywords2.length} keywords in keywords-continued.md`);
    } else {
      console.log('keywords-continued.md not found!');
    }
    
    console.log(`Total keywords to import: ${allKeywords.length}`);
    
    // Import keywords in batches
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const keywordData of allKeywords) {
      const slug = generateSlug(keywordData.keyword);
      
      try {
        // Check if keyword already exists
        const existing = await prisma.seoKeyword.findUnique({
          where: { keyword: keywordData.keyword },
        });
        
        if (existing) {
          // Update existing keyword
          await prisma.seoKeyword.update({
            where: { id: existing.id },
            data: {
              category: keywordData.category,
              priority: keywordData.priority,
              slug,
              updatedAt: new Date(),
            },
          });
          updated++;
        } else {
          // Create new keyword
          await prisma.seoKeyword.create({
            data: {
              keyword: keywordData.keyword,
              slug,
              category: keywordData.category,
              priority: keywordData.priority,
              variations: [],
            },
          });
          imported++;
        }
        
        if ((imported + updated) % 100 === 0) {
          console.log(`Progress: ${imported + updated} / ${allKeywords.length}`);
        }
      } catch (error) {
        console.error(`Error importing keyword "${keywordData.keyword}":`, error);
        skipped++;
      }
    }
    
    console.log('\n=== Import Complete ===');
    console.log(`Imported: ${imported}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${imported + updated + skipped}`);
    
    // Verify import
    const totalCount = await prisma.seoKeyword.count();
    console.log(`\nTotal keywords in database: ${totalCount}`);
    
    // Show priority distribution
    const tier1Count = await prisma.seoKeyword.count({ where: { priority: 1 } });
    const tier2Count = await prisma.seoKeyword.count({ where: { priority: 2 } });
    const tier3Count = await prisma.seoKeyword.count({ where: { priority: 3 } });
    
    console.log('\nPriority Distribution:');
    console.log(`Tier 1 (Priority 1): ${tier1Count} keywords`);
    console.log(`Tier 2 (Priority 2): ${tier2Count} keywords`);
    console.log(`Tier 3 (Priority 3): ${tier3Count} keywords`);
    
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importKeywords()
  .then(() => {
    console.log('\nKeyword import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Keyword import failed:', error);
    process.exit(1);
  });
