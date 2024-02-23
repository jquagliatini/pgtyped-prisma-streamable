const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");

main().catch(console.error);
async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg(
      new Pool({ connectionString: process.env.DATABASE_URL })
    ),
  });
  await prisma.$transaction(
    Array(11)
      .fill(undefined)
      .map(
        (_, i) =>
          prisma.$executeRaw`
						INSERT INTO client (name)
						SELECT 'Client ' || n
						FROM generate_series(${i * 1e5}::BIGINT, ${(i + 1) * 1e5}::BIGINT) n
					`
      )
  );
  await prisma.$disconnect();
}
