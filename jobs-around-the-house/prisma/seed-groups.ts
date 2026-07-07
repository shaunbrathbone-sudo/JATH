import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const groups = [
    {
        name: "Cleaning Services",
        slug: "cleaning-services",
        description:
            "Professional cleaning for driveways, patios, windows, gutters and outdoor surfaces.",
        icon: "spray",
        sortOrder: 1,
        categorySlugs: ["jet-washing", "guttering"],
    },
    {
        name: "Garden Services",
        slug: "garden-services",
        description:
            "Fencing, garden clearance, shed builds and outdoor maintenance to transform your garden.",
        icon: "tree",
        sortOrder: 2,
        categorySlugs: ["fencing", "garden-clearance", "shed-services"],
    },
    {
        name: "Home Services",
        slug: "home-services",
        description:
            "Flat-pack assembly, picture hanging, shelving and general DIY around the house.",
        icon: "home",
        sortOrder: 3,
        categorySlugs: ["flat-pack-assembly", "picture-hanging", "general-diy"],
    },
    {
        name: "Tech Installation",
        slug: "tech-installation",
        description:
            "TV wall mounting, home networking, smart home devices and tech setup by professionals.",
        icon: "monitor",
        sortOrder: 4,
        categorySlugs: ["tech-installation"],
    },
];

async function main() {
    for (const g of groups) {
        const group = await prisma.category.create({
            data: {
                name: g.name,
                slug: g.slug,
                description: g.description,
                parentId: null,
                sortOrder: g.sortOrder,
            },
        });
        console.log(`✓ Created group: ${g.name} (${group.id})`);

        for (const slug of g.categorySlugs) {
            const cat = await prisma.category.findUnique({ where: { slug } });
            if (cat) {
                await prisma.category.update({
                    where: { id: cat.id },
                    data: { parentId: group.id },
                });
                console.log(`  → Assigned: ${cat.name}`);
            } else {
                console.log(`  ✗ Category "${slug}" not found`);
            }
        }
    }

    console.log("\n✅ Service groups seeded!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
