/**
 * Seed additional hero images for all categories.
 * Run with: npx tsx prisma/seed-hero-images.ts
 *
 * This script is idempotent — it skips images that already exist.
 */

import prisma from "../src/lib/prisma";

type HeroImageEntry = {
    filename: string;
    imageUrl: string;
};

// Map category slug → list of hero image files to add
const heroImagesByCategory: Record<string, HeroImageEntry[]> = {
    // ===== JET WASHING =====
    "jet-washing": [
        { filename: "jw-patio.png", imageUrl: "/hero/jw-patio.png" },
        { filename: "jw-decking.png", imageUrl: "/hero/jw-decking.png" },
        { filename: "jw-steps.png", imageUrl: "/hero/jw-steps.png" },
        { filename: "jw-tarmac.png", imageUrl: "/hero/jw-tarmac.png" },
        { filename: "jw-fence.png", imageUrl: "/hero/jw-fence.png" },
    ],

    // ===== SHED SERVICES =====
    "shed-services": [
        { filename: "shed-build.png", imageUrl: "/hero/shed-build.png" },
        { filename: "shed-demolish.png", imageUrl: "/hero/shed-demolish.png" },
        { filename: "shed-base.png", imageUrl: "/hero/shed-base.png" },
        { filename: "shed-summer.png", imageUrl: "/hero/shed-summer.png" },
        // shed-roof.png — pending generation (quota hit)
    ],

    // ===== TECH INSTALLATION =====
    // Already has 6 images, will add 5 more when quota resets
    "tech-installation": [
        // { filename: "tech-soundbar.png", imageUrl: "/hero/tech-soundbar.png" },
        // { filename: "tech-router.png", imageUrl: "/hero/tech-router.png" },
        // { filename: "tech-projector.png", imageUrl: "/hero/tech-projector.png" },
        // { filename: "tech-smart-home.png", imageUrl: "/hero/tech-smart-home.png" },
        // { filename: "tech-cabling.png", imageUrl: "/hero/tech-cabling.png" },
    ],

    // ===== FENCING =====
    fencing: [
        // { filename: "fence-gate.png", imageUrl: "/hero/fence-gate.png" },
        // { filename: "fence-post.png", imageUrl: "/hero/fence-post.png" },
        // { filename: "fence-trellis.png", imageUrl: "/hero/fence-trellis.png" },
        // { filename: "fence-close-board.png", imageUrl: "/hero/fence-close-board.png" },
        // { filename: "fence-repair.png", imageUrl: "/hero/fence-repair.png" },
    ],

    // ===== FLAT-PACK ASSEMBLY =====
    "flat-pack-assembly": [
        // { filename: "flatpack-desk.png", imageUrl: "/hero/flatpack-desk.png" },
        // { filename: "flatpack-bookshelf.png", imageUrl: "/hero/flatpack-bookshelf.png" },
        // { filename: "flatpack-bed.png", imageUrl: "/hero/flatpack-bed.png" },
        // { filename: "flatpack-kitchen.png", imageUrl: "/hero/flatpack-kitchen.png" },
        // { filename: "flatpack-drawers.png", imageUrl: "/hero/flatpack-drawers.png" },
    ],

    // ===== GARDEN & CLEARANCE =====
    "garden-clearance": [
        // { filename: "garden-hedge.png", imageUrl: "/hero/garden-hedge.png" },
        // { filename: "garden-lawn.png", imageUrl: "/hero/garden-lawn.png" },
        // { filename: "garden-waste.png", imageUrl: "/hero/garden-waste.png" },
        // { filename: "garden-planting.png", imageUrl: "/hero/garden-planting.png" },
        // { filename: "garden-strimming.png", imageUrl: "/hero/garden-strimming.png" },
    ],

    // ===== PICTURE & MIRROR HANGING =====
    "picture-hanging": [
        // { filename: "picture-gallery.png", imageUrl: "/hero/picture-gallery.png" },
        // { filename: "picture-mirror.png", imageUrl: "/hero/picture-mirror.png" },
        // { filename: "picture-shelves.png", imageUrl: "/hero/picture-shelves.png" },
        // { filename: "picture-canvas.png", imageUrl: "/hero/picture-canvas.png" },
        // { filename: "picture-frame.png", imageUrl: "/hero/picture-frame.png" },
    ],

    // ===== GUTTERING SERVICES =====
    guttering: [
        // { filename: "gutter-clean.png", imageUrl: "/hero/gutter-clean.png" },
        // { filename: "gutter-repair.png", imageUrl: "/hero/gutter-repair.png" },
        // { filename: "gutter-replace.png", imageUrl: "/hero/gutter-replace.png" },
        // { filename: "gutter-downpipe.png", imageUrl: "/hero/gutter-downpipe.png" },
        // { filename: "gutter-fascia.png", imageUrl: "/hero/gutter-fascia.png" },
    ],

    // ===== GENERAL DIY =====
    "general-diy": [
        // { filename: "diy-shelving.png", imageUrl: "/hero/diy-shelving.png" },
        // { filename: "diy-curtain.png", imageUrl: "/hero/diy-curtain.png" },
        // { filename: "diy-door.png", imageUrl: "/hero/diy-door.png" },
        // { filename: "diy-tiling.png", imageUrl: "/hero/diy-tiling.png" },
        // { filename: "diy-painting.png", imageUrl: "/hero/diy-painting.png" },
    ],
};

async function main() {
    console.log("🖼️  Seeding hero images...\n");

    let totalAdded = 0;
    let totalSkipped = 0;

    for (const [categorySlug, images] of Object.entries(heroImagesByCategory)) {
        if (images.length === 0) {
            console.log(`  ⏭️  ${categorySlug}: no new images to add`);
            continue;
        }

        const category = await prisma.category.findUnique({
            where: { slug: categorySlug },
        });

        if (!category) {
            console.warn(`  ⚠️  Category not found: ${categorySlug}`);
            continue;
        }

        for (const img of images) {
            // Check if already exists
            const existing = await prisma.heroImage.findFirst({
                where: {
                    categoryId: category.id,
                    imageUrl: img.imageUrl,
                },
            });

            if (existing) {
                console.log(`  ⏭️  ${categorySlug}: ${img.filename} already exists`);
                totalSkipped++;
                continue;
            }

            await prisma.heroImage.create({
                data: {
                    categoryId: category.id,
                    imageUrl: img.imageUrl,
                    filename: img.filename,
                    isActive: true,
                },
            });

            console.log(`  ✅ ${categorySlug}: added ${img.filename}`);
            totalAdded++;
        }
    }

    console.log(`\n🎉 Done! Added ${totalAdded} new hero images, skipped ${totalSkipped} existing.`);
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
