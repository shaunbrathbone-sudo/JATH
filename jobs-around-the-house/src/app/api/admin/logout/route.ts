import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/auth";

export const POST = async () => {
    await destroySession();
    return NextResponse.json({ success: true });
};
