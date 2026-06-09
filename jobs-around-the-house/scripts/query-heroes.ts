import prisma from "../src/lib/prisma";

async function main() {
    const cats = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            heroImages: {
                select: { id: true, imageUrl: true, isActive: true },
            },
        },
        orderBy: { sortOrder: "asc" },
    });
    console.log(JSON.stringify(cats, null, 2));
    await prisma.$disconnect();
}

main();
