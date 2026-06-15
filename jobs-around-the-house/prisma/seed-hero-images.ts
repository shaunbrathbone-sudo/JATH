import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Clear out any existing hero images
    await prisma.heroImage.deleteMany();

    const categories = await prisma.category.findMany();
    console.log("Current categories:", categories.map(c => c.slug));

    const imageMapping: Record<string, string> = {
        "garden-buildings": "/hero/shed-services.png",
        "timber-sheds": "/hero/shed-build.png",
        "pent-sheds": "/hero/shed-base.png",
        "installation-services": "/hero/shed-services.png",
    };

    for (const cat of categories) {
        const imgUrl = imageMapping[cat.slug];
        if (imgUrl) {
            await prisma.heroImage.create({
                data: {
                    categoryId: cat.id,
                    imageUrl: imgUrl,
                    filename: imgUrl.split("/").pop() || "",
                    isActive: true,
                },
            });
            console.log(`✓ Seeded hero image for category ${cat.slug} -> ${imgUrl}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
