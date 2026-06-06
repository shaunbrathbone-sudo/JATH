import prisma from "../src/lib/prisma";
import fs from "fs";
import path from "path";

const techImages = [
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\cctv_install_female_1780696134429.png",
        destFilename: "cctv-install.png",
        productName: "CCTV Installation",
        slug: "cctv-installation",
        description: "Professional installation of home CCTV security systems.",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\doorbell_install_male_1780696144842.png",
        destFilename: "doorbell-install.png",
        productName: "Smart Doorbell Installation",
        slug: "smart-doorbell-installation",
        description: "Setup and installation of smart video doorbells.",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\pc_install_female_1780696155038.png",
        destFilename: "pc-install.png",
        productName: "PC Setup & Installation",
        slug: "pc-setup",
        description: "Complete setup of your new desktop PC and peripherals.",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\nas_install_male_1780696163580.png",
        destFilename: "nas-install.png",
        productName: "Home NAS Box Setup",
        slug: "nas-setup",
        description:
            "Installation and configuration of Network Attached Storage.",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\printer_install_female_1780696174216.png",
        destFilename: "printer-install.png",
        productName: "Printer Setup",
        slug: "printer-setup",
        description: "Network or local printer installation and configuration.",
    },
    {
        source: "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\a8d545e1-c8bf-4279-8100-13f2c1e72fd3\\wifi_install_male_1780696183569.png",
        destFilename: "wifi-install.png",
        productName: "Wi-Fi Extenders & Router Setup",
        slug: "wifi-setup",
        description: "Optimize your home network with routers and extenders.",
    },
];

async function main() {
    // Ensure the uploads directory exists
    const uploadsDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "hero-images",
    );
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get tech-installation category
    const techCategory = await prisma.category.findUnique({
        where: { slug: "tech-installation" },
    });

    if (!techCategory) {
        throw new Error("Category 'tech-installation' not found!");
    }

    for (const item of techImages) {
        // 1. Copy the image
        const destPath = path.join(uploadsDir, item.destFilename);
        if (fs.existsSync(item.source)) {
            fs.copyFileSync(item.source, destPath);
            console.log(`Copied ${item.destFilename}`);
        } else {
            console.warn(`Source image not found: ${item.source}`);
            continue;
        }

        const publicImageUrl = `/uploads/hero-images/${item.destFilename}`;

        // 2. Upsert the product
        const product = await prisma.product.upsert({
            where: { slug: item.slug },
            update: {
                imageUrl: publicImageUrl,
            },
            create: {
                name: item.productName,
                slug: item.slug,
                description: item.description,
                categoryId: techCategory.id,
                hourlyRate: 50,
                pricingType: "HOURLY",
                isActive: true,
                sortOrder: 10,
                imageUrl: publicImageUrl,
            },
        });

        console.log(`Upserted product: ${product.name}`);

        // 3. Create HeroImage record
        // First, check if it already exists to avoid duplicates
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
            console.log(`Created hero image for ${product.name}`);
        }
    }

    console.log("Tech installation products seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
