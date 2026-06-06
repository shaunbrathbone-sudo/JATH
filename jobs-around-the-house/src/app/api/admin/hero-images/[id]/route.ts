import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// Upload a new hero image for a category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { slug: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category already has 6 hero images
    const imageCount = await prisma.heroImage.count({
      where: { categoryId },
    });

    if (imageCount >= 6) {
      return NextResponse.json(
        { error: "Maximum of 6 hero images allowed per category. Delete some first." },
        { status: 400 }
      );
    }

    // Ensure hero directory exists
    const heroDir = path.join(process.cwd(), "public", "hero");
    await mkdir(heroDir, { recursive: true });

    // Save file with unique name
    const ext = file.name.split(".").pop() || "png";
    const timestamp = Date.now();
    const filename = `${category.slug}-${timestamp}.${ext}`;
    const filepath = path.join(heroDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const imageUrl = `/hero/${filename}`;

    // Create new image and set as active
    const heroImage = await prisma.heroImage.create({
      data: {
        categoryId,
        imageUrl,
        filename: file.name,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, heroImage });
  } catch (error) {
    console.error("Failed to upload hero image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

// Delete a hero image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: imageId } = await params;

    const heroImage = await prisma.heroImage.findUnique({
      where: { id: imageId },
    });

    if (!heroImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Attempt to delete physical file from public directory
    try {
      const publicPath = path.join(process.cwd(), "public");
      const filepath = path.join(publicPath, heroImage.imageUrl);
      await unlink(filepath);
    } catch (err) {
      console.warn("Could not delete physical file:", err);
    }

    // Delete from DB
    await prisma.heroImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete hero image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

