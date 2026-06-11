require('dotenv').config();
const prisma = require('../backend/config/prismaClient');

async function main() {
  await prisma.$connect();
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log('Connected to Neon PostgreSQL');
  console.log('Tables:', tables.map((t) => t.table_name).join(', '));
}

main()
  .catch((err) => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
