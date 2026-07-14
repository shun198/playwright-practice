import { NextResponse } from "next/server";
import {
  createDemoSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS
} from "../../../lib/demo-session";
import { DEMO_MEMBER } from "../../../lib/demo-member";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginPayload | null;

  if (body?.email !== DEMO_MEMBER.email || body.password !== DEMO_MEMBER.password) {
    return NextResponse.json(
      { message: "メールアドレスまたはパスワードが正しくありません。" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ message: "ログインに成功しました。" });
  response.cookies.set(SESSION_COOKIE_NAME, createDemoSession(), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return response;
}
