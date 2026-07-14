import { NextResponse } from "next/server";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  contactType?: unknown;
  agree?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isContactType(value: unknown): value is "general" | "support" {
  return value === "general" || value === "support";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const name = body.name;
    const email = body.email;
    const message = body.message;
    const contactType = body.contactType;
    const agree = body.agree;

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

    if (!isContactType(contactType)) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "contactType は general または support を指定してください。"
        },
        { status: 400 }
      );
    }

    if (agree !== true) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "利用規約への同意が必要です。"
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
