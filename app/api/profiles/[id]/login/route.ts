import { NextResponse } from "next/server";
import {
  profileExists,
  getLogin,
  enableLogin,
  disableLogin,
} from "@/lib/contract-mock/profileStore";
import type { ExplorerLoginRequest } from "@/lib/contract-mock/types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Mock: a profile's explorer-login status (`GET /profiles/:id/login`). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!profileExists(id)) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json(getLogin(id));
}

/** Mock: give a profile its own login (`POST /profiles/:id/login`). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!profileExists(id)) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  let body: ExplorerLoginRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email must be a valid email address" }, { status: 422 });
  }
  const { status, action_link, created } = enableLogin(id, email);
  return NextResponse.json({ ...status, action_link }, { status: created ? 201 : 200 });
}

/** Mock: revoke a profile's login (`DELETE /profiles/:id/login`). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const revoked = disableLogin(id);
  if (!revoked) {
    return NextResponse.json({ error: "No active login for this profile" }, { status: 404 });
  }
  return NextResponse.json(revoked);
}
