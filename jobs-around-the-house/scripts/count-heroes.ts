import prisma from "../src/lib/prisma";

async function main() {
    const cats = await prisma.category.findMany({
        select: {
            name: true,
            _count: { select: { heroImages: true } },
        },
        orderBy: { sortOrder: "asc" },
    });
    cats.forEach((c) =>
        console.log(`${c.name}: ${c._count.heroImages} images`)
    );
    await prisma.$disconnect();
}

main();
