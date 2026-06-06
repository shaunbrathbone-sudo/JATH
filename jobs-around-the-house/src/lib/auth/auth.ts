/**
 * Simple cookie-based session management for admin auth.
 * Uses a signed token stored in an HTTP-only cookie.
 */

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import crypto from "crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// Simple token: base64(adminId:timestamp:signature)
const SECRET = process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me-in-production";

const sign = (data: string): string => {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex")
    .slice(0, 16);
};

const createSession = async (adminId: string): Promise<void> => {
  const timestamp = Date.now().toString();
  const payload = `${adminId}:${timestamp}`;
  const signature = sign(payload);
  const token = Buffer.from(`${payload}:${signature}`).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
};

type VerifySessionResult = {
  authenticated: boolean;
  adminId?: string;
  admin?: { id: string; email: string; name: string; role: string };
};

const verifySession = async (): Promise<VerifySessionResult> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return { authenticated: false };

    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return { authenticated: false };

    const [adminId, timestamp, signature] = parts;

    // Verify signature
    const expectedSig = sign(`${adminId}:${timestamp}`);
    if (signature !== expectedSig) return { authenticated: false };

    // Check expiry
    const age = (Date.now() - parseInt(timestamp)) / 1000;
    if (age > SESSION_MAX_AGE) return { authenticated: false };

    // Verify admin still exists
    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!admin) return { authenticated: false };

    return { authenticated: true, adminId: admin.id, admin };
  } catch {
    return { authenticated: false };
  }
};

const destroySession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
};

type ValidateCredentialsResult = {
  id: string;
  email: string;
  name: string;
  role: string;
} | null;

const validateCredentials = async (
  email: string,
  password: string
): Promise<ValidateCredentialsResult> => {
  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
};

export { createSession, verifySession, destroySession, validateCredentials };
export type { VerifySessionResult, ValidateCredentialsResult };
