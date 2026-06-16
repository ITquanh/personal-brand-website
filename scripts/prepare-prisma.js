const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  if (!fs.existsSync(schemaPath)) {
    console.error(`Prisma schema file not found at: ${schemaPath}`);
    process.exit(1);
  }

  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // 检查当前是否为 sqlite
  if (schemaContent.includes('provider = "sqlite"') || schemaContent.includes('provider = \'sqlite\'')) {
    console.log('Converting Prisma schema from SQLite to PostgreSQL...');
    
    // 自动检测可用的数据库环境变量，优先选择 pooled 数据库连接，支持多种云端集成命名
    let dbEnvVar = 'POSTGRES_PRISMA_URL';
    const possibleVars = ['POSTGRES_PRISMA_URL', 'POSTGRES_URL', 'STORAGE_URL', 'DATABASE_URL'];
    for (const v of possibleVars) {
      if (process.env[v]) {
        dbEnvVar = v;
        break;
      }
    }
    console.log(`Using database environment variable: ${dbEnvVar}`);

    schemaContent = schemaContent.replace(/provider\s*=\s*["']sqlite["']/g, 'provider = "postgresql"');
    schemaContent = schemaContent.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, `url = env("${dbEnvVar}")`);
    fs.writeFileSync(schemaPath, schemaContent, 'utf8');
    console.log('Successfully prepared Prisma schema for production database (PostgreSQL).');
  } else {
    console.log('Prisma schema already configured for PostgreSQL or another database.');
  }
} catch (error) {
  console.error('Failed to prepare Prisma schema for PostgreSQL:', error);
  process.exit(1);
}
