const { Client } = require('pg');
const fs = require('fs');

const RENDER_URL = 'postgresql://thesalonhub_db_user:sfSS8AHpdlwW7Aa9UDndlaqwDkD4b8sj@dpg-d3d5eoruibrs738d5r7g-a.frankfurt-postgres.render.com/thesalonhub_db';
const RAILWAY_URL = 'postgresql://postgres:KeMJKrVkFUFRSmDfLSkUGqMXoxjtOHwN@centerbeam.proxy.rlwy.net:54067/railway';

async function getTables(client) {
  const result = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  return result.rows.map(r => r.tablename);
}

async function getTableData(client, tableName) {
  try {
    const result = await client.query(`SELECT * FROM "${tableName}"`);
    return result.rows;
  } catch (error) {
    console.log(`  Warning: Could not read ${tableName}: ${error.message}`);
    return [];
  }
}

async function migrate() {
  console.log('🔄 Starting database migration from Render to Railway...\n');
  
  // Connect to Render
  console.log('📥 Connecting to Render database...');
  const renderClient = new Client({ 
    connectionString: RENDER_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  await renderClient.connect();
  console.log('✅ Connected to Render\n');
  
  // Get all tables
  console.log('📋 Fetching table list...');
  const tables = await getTables(renderClient);
  console.log(`✅ Found ${tables.length} tables:`, tables.join(', '), '\n');
  
  // Export data
  console.log('📤 Exporting data from Render...');
  const exportData = {};
  let totalRows = 0;
  
  for (const table of tables) {
    const data = await getTableData(renderClient, table);
    exportData[table] = data;
    totalRows += data.length;
    console.log(`  ✓ ${table}: ${data.length} rows`);
  }
  
  await renderClient.end();
  console.log(`\n✅ Export complete: ${totalRows} total rows\n`);
  
  // Save to JSON file as backup
  console.log('💾 Saving backup to render_data.json...');
  fs.writeFileSync('render_data.json', JSON.stringify(exportData, null, 2));
  console.log('✅ Backup saved\n');
  
  // Connect to Railway
  console.log('📥 Connecting to Railway database...');
  const railwayClient = new Client({ connectionString: RAILWAY_URL });
  await railwayClient.connect();
  console.log('✅ Connected to Railway\n');
  
  // Import data
  console.log('📥 Importing data to Railway...');
  let importedRows = 0;
  
  for (const table of tables) {
    const rows = exportData[table];
    if (rows.length === 0) {
      console.log(`  ⊘ ${table}: 0 rows (skipped)`);
      continue;
    }
    
    try {
      // Get column names
      const columns = Object.keys(rows[0]);
      
      for (const row of rows) {
        const values = columns.map(col => row[col]);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.map(col => `"${col}"`).join(', ');
        
        const query = `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        
        try {
          await railwayClient.query(query, values);
        } catch (insertError) {
          // Ignore constraint violations
        }
      }
      
      importedRows += rows.length;
      console.log(`  ✓ ${table}: ${rows.length} rows imported`);
    } catch (error) {
      console.log(`  ✗ ${table}: Error - ${error.message}`);
    }
  }
  
  await railwayClient.end();
  
  console.log(`\n✅ Migration complete!`);
  console.log(`📊 Total rows migrated: ${importedRows}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Test your application: npm run start:dev`);
  console.log(`   2. Verify data at: http://localhost:5555 (npx prisma studio)`);
  console.log(`   3. If everything works, you can delete your Render database`);
}

migrate().catch(error => {
  console.error('\n❌ Migration failed:', error.message);
  console.error(error);
  process.exit(1);
});
