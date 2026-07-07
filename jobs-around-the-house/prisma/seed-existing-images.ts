import prisma from "../src/lib/prisma";
import fs from "fs";
import path from "path";

const existingImages = [
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\driveway_jet_wash_1780696677259.png",
        destFilename: "driveway-jet-wash.png",
        slug: "driveway-jet-wash",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\patio_jet_wash_1780696689199.png",
        destFilename: "patio-jet-wash.png",
        slug: "patio-jet-wash",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\shed_removal_1780696699224.png",
        destFilename: "shed-removal.png",
        slug: "shed-removal",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\tv_wall_mount_1780696710043.png",
        destFilename: "tv-wall-mount.png",
        slug: "tv-wall-mount",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\fence_panel_replacement_1780696732362.png",
        destFilename: "fence-panel.png",
        slug: "fence-panel-replacement",
    },
];

async function main() {
    const uploadsDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "hero-images",
    );
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const item of existingImages) {
        if (!fs.existsSync(item.source)) {
            console.warn(`Source image not found: ${item.source}`);
            continue;
        }

        const destPath = path.join(uploadsDir, item.destFilename);
        fs.copyFileSync(item.source, destPath);
        console.log(`Copied ${item.destFilename}`);

        const publicImageUrl = `/uploads/hero-images/${item.destFilename}`;

        const product = await prisma.product.findUnique({
            where: { slug: item.slug },
        });

        if (!product) {
            console.error(`Product not found for slug: ${item.slug}`);
            continue;
        }

        // Update product featured image
        await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: publicImageUrl },
        });

        // Check if hero image exists
        const existingHero = await prisma.heroImage.findFirst({
            where: {
                product: { id: product.id },
                imageUrl: publicImageUrl,
            },
        });

        if (!existingHero) {
            await prisma.heroImage.create({
                data: {
                    imageUrl: publicImageUrl,
                    product: { connect: { id: product.id } },
                    filename: item.destFilename,
                    isActive: true,
                },
            });
            console.log(`Created hero image for ${product.title}`);
        }
    }

    console.log("Existing products image seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
