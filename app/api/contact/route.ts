import { NextResponse } from "next/server";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const name = body.name;
    const email = body.email;
    const message = body.message;

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(message)) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "name, email, message は必須です。"
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "email の形式が不正です。"
        },
        { status: 400 }
      );
    }

    // テスト用に 500 を再現するフラグ
    if (request.headers.get("x-force-error") === "500" || message.includes("[force-500]")) {
      throw new Error("Simulated server error");
    }

    return NextResponse.json(
      {
        code: "OK",
        message: "お問い合わせを受け付けました。"
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "サーバー内部でエラーが発生しました。"
      },
      { status: 500 }
    );
  }
}
