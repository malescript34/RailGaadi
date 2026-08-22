import { NextRequest, NextResponse } from "next/server";
import { providerRegistry } from "@/lib/providers/registry";
import { cached, enforceRateLimit } from "@/lib/production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const limited = enforceRateLimit(request, "journey-live", 90);
    if (limited) return limited;
    const { journeyId } = await params;
    if (!/^\d{5,6}$/.test(journeyId)) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Enter a valid 5 or 6 digit train number" } },
        { status: 400 }
      );
    }

    const provider = providerRegistry.getTrainProvider();
    const liveStatus = await cached(`journey-live:${journeyId}`, 15, () => provider.getLiveStatus(journeyId));

    if (!liveStatus) {
      return NextResponse.json(
        { error: { code: "JOURNEY_NOT_FOUND", message: "Journey not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: liveStatus },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error in live journey API:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Live status currently unavailable. Please retry.",
        },
      },
      { status: 500 }
    );
  }
}
