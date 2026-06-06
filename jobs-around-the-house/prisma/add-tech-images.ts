import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { copyFile, mkdir } from "fs/promises";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const images = [
    {
        src: "C:/Users/shaun/.gemini/antigravity-ide/brain/a8d545e1-c8bf-4279-8100-13f2c1e72fd3/tech_hero_cctv_1780678753698.png",
        dest: "tech-cctv.png",
        filename: "CCTV Installation",
    },
    {
        src: "C:/Users/shaun/.gemini/antigravity-ide/brain/a8d545e1-c8bf-4279-8100-13f2c1e72fd3/tech_hero_doorbell_1780678766158.png",
        dest: "tech-doorbell.png",
        filename: "Doorbell Installation",
    },
    {
        src: "C:/Users/shaun/.gemini/antigravity-ide/brain/a8d545e1-c8bf-4279-8100-13f2c1e72fd3/tech_hero_pc_1780678778255.png",
        dest: "tech-pc.png",
        filename: "PC Setup",
    },
    {
        src: "C:/Users/shaun/.gemini/antigravity-ide/brain/a8d545e1-c8bf-4279-8100-13f2c1e72fd3/tech_hero_nas_1780678789466.png",
        dest: "tech-nas.png",
        filename: "Home NAS Installation",
    },
    {
        src: "C:/Users/shaun/.gemini/antigravity-ide/brain/a8d545e1-c8bf-4279-8100-13f2c1e72fd3/tech_hero_printer_1780678801622.png",
        dest: "tech-printer.png",
        filename: "Printer Setup",
    },
    {
        src: "C:/Users/shaun/.gemini/antigravity-ide/brain/a8d545e1-c8bf-4279-8100-13f2c1e72fd3/tech_hero_wifi_1780678813250.png",
        dest: "tech-wifi.png",
        filename: "Wi-Fi & Router Setup",
    },
];

async function main() {
    const category = await prisma.category.findUnique({
        where: { slug: "tech-installation" },
    });

    if (!category) {
        console.error("Category 'tech-installation' not found!");
        return;
    }

    // Ensure public/hero exists
    const heroDir = path.join(process.cwd(), "public", "hero");
    await mkdir(heroDir, { recursive: true });

    // Delete existing HeroImage rows for this category
    await prisma.heroImage.deleteMany({
        where: { categoryId: category.id },
    });

    for (const img of images) {
        const destPath = path.join(heroDir, img.dest);
        await copyFile(img.src, destPath);
        console.log(`Copied ${img.src} -> ${destPath}`);

        await prisma.heroImage.create({
            data: {
                categoryId: category.id,
                imageUrl: `/hero/${img.dest}`,
                filename: img.filename,
                isActive: true,
            },
        });
    }

    console.log(
        "\n✅ Database updated with new Tech Installation hero images!",
    );
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
