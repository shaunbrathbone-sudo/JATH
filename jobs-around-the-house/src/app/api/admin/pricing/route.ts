import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { updates } = await request.json() as {
      updates: { key: string; value: number }[];
    };

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid updates" },
        { status: 400 }
      );
    }

    // Update each variable
    await Promise.all(
      updates.map((u) =>
        prisma.pricingVariable.update({
          where: { key: u.key },
          data: { value: u.value },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update pricing:", error);
    return NextResponse.json(
      { error: "Failed to update pricing" },
      { status: 500 }
    );
  }
}
