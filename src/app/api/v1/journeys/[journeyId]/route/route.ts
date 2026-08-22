import { NextRequest, NextResponse } from "next/server";
import { providerRegistry } from "@/lib/providers/registry";
import { cached, enforceRateLimit } from "@/lib/production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const limited = enforceRateLimit(request, "journey-route", 60);
    if (limited) return limited;
    const { journeyId } = await params;
    if (!/^\d{5,6}$/.test(journeyId)) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Enter a valid 5 or 6 digit train number" } },
        { status: 400 }
      );
    }

    const provider = providerRegistry.getTrainProvider();
    const journey = await cached(`journey-route:${journeyId}`, 900, () => provider.getJourney(journeyId));

    if (!journey) {
      return NextResponse.json(
        { error: { code: "JOURNEY_NOT_FOUND", message: "Journey not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          journeyId: journey.id,
          train: journey.train,
          serviceDate: journey.serviceDate,
          origin: journey.origin,
          destination: journey.destination,
          stations: journey.stations,
          route: journey.route,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error in journey route API:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Journey route information unavailable.",
        },
      },
      { status: 500 }
    );
  }
}
