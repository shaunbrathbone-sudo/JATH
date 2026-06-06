/**
 * Migrate existing hero images from public/hero/ into HeroImage table
 */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
    const heroDir = path.join(process.cwd(), "public", "hero");

    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
    });

    for (const cat of categories) {
        // Check if image file exists
        const pngPath = path.join(heroDir, `${cat.slug}.png`);
        if (fs.existsSync(pngPath)) {
            await prisma.heroImage.create({
                data: {
                    categoryId: cat.id,
                    imageUrl: `/hero/${cat.slug}.png`,
                    filename: `${cat.slug}.png`,
                    isActive: true,
                },
            });
            console.log(`  ✓ ${cat.name} → /hero/${cat.slug}.png (active)`);
        } else {
            console.log(`  ✗ ${cat.name} — no image found`);
        }
    }

    console.log("\n✅ Migration complete!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
