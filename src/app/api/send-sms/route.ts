import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    // Server v Next.js pošle požadavek na mobil (bez blokování v prohlížeči)
    const response = await fetch("http://10.10.5.30:8080/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, error: errorText }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}