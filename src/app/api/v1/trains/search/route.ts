import { NextRequest, NextResponse } from "next/server";
import { providerRegistry } from "@/lib/providers/registry";
import { cached, enforceRateLimit } from "@/lib/production";

export async function GET(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, "train-search", 30);
    if (limited) return limited;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim() || query.trim().length < 2) {
      return NextResponse.json(
        { data: [], message: "Query must be at least 2 characters" },
        { status: 200 }
      );
    }

    if (query.length > 80) {
      return NextResponse.json(
        { error: { code: "INVALID_QUERY", message: "Search query is too long" } },
        { status: 400 }
      );
    }

    const provider = providerRegistry.getTrainProvider();
    const results = await cached(`search:${query.trim().toLowerCase()}`, 300, () => provider.searchTrains(query));

    return NextResponse.json(
      {
        data: results,
        count: results.length,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error in train search API:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "We couldn't search trains right now. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
