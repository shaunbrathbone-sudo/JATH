/**
 * Quick script to set hero images for each category
 */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const heroImages: Record<string, string> = {
  "jet-washing": "/hero/jet-washing.png",
  "shed-services": "/hero/shed-services.png",
  "tech-installation": "/hero/tech-installation.png",
  "fencing": "/hero/fencing.png",
  "flat-pack-assembly": "/hero/flat-pack-assembly.png",
  "garden-clearance": "/hero/garden-clearance.png",
  "picture-hanging": "/hero/picture-hanging.png",
  "guttering": "/hero/guttering.png",
  "general-diy": "/hero/general-diy.png",
};

async function main() {
  for (const [slug, url] of Object.entries(heroImages)) {
    await prisma.category.update({
      where: { slug },
      data: { heroImageUrl: url },
    });
    console.log(`  ✓ ${slug} → ${url}`);
  }
  console.log("\n✅ Hero images set!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
