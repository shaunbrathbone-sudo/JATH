import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Toggle a specific hero image's active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: imageId } = await params;
    const { isActive } = await request.json();

    // Update the selected image's active status directly
    const updatedImage = await prisma.heroImage.update({
      where: { id: imageId },
      data: { isActive: !!isActive },
    });

    return NextResponse.json({ success: true, heroImage: updatedImage });
  } catch (error) {
    console.error("Failed to toggle hero image:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

