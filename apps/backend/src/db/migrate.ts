import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './connection';
import path from 'path';

async function runMigrations() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  console.log('✅ Migrations complete');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
