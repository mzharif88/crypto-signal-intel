import { NextRequest, NextResponse } from "next/server";

const CG_BASE = process.env.COINGECKO_API_KEY
  ? "https://pro-api.coingecko.com/api/v3"
  : "https://api.coingecko.com/api/v3";

const HEADERS: Record<string, string> = process.env.COINGECKO_API_KEY
  ? { "x-cg-pro-api-key": process.env.COINGECKO_API_KEY }
  : process.env.COINGECKO_DEMO_KEY
  ? { "x-cg-demo-api-key": process.env.COINGECKO_DEMO_KEY }
  : {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "/global";
  const params = new URLSearchParams(searchParams);
  params.delete("path");

  const url = `${CG_BASE}${path}${params.size ? "?" + params.toString() : ""}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", ...HEADERS },
      next: { revalidate: 30 }, // cache 30s
    });

    if (!res.ok) {
      return NextResponse.json({ error: `CG ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
