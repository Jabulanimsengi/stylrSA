const { exec } = require('child_process');
const fs = require('fs');

const RENDER_URL = 'postgresql://thesalonhub_db_user:sfSS8AHpdlwW7Aa9UDndlaqwDkD4b8sj@dpg-d3d5eoruibrs738d5r7g-a.frankfurt-postgres.render.com/thesalonhub_db';

console.log('Connecting to Render database...');
console.log('Exporting data...');

const pgDumpCmd = `npx pg-dump "${RENDER_URL}" -f render_backup.sql`;

exec(pgDumpCmd, (error, stdout, stderr) => {
  if (error) {
    console.error('Error during export:', error.message);
    console.error('stderr:', stderr);
    process.exit(1);
  }
  
  if (stderr) {
    console.log('Warnings:', stderr);
  }
  
  console.log('Export completed!');
  
  // Check if file exists
  if (fs.existsSync('render_backup.sql')) {
    const stats = fs.statSync('render_backup.sql');
    console.log(`Backup file created: ${stats.size} bytes`);
  } else {
    console.log('Warning: Backup file not found!');
  }
});
