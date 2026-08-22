import { NextRequest, NextResponse } from "next/server";
import { providerRegistry } from "@/lib/providers/registry";
import { cached, enforceRateLimit } from "@/lib/production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await params;
    const limited = enforceRateLimit(request, "journey-elevation", 12);
    if (limited) return limited;
    const trainProvider = providerRegistry.getTrainProvider();
    const journey = await cached(`journey-route:${journeyId}`, 900, () => trainProvider.getJourney(journeyId));

    if (!journey) {
      return NextResponse.json(
        { error: { code: "JOURNEY_NOT_FOUND", message: "Journey not found" } },
        { status: 404 }
      );
    }

    const coords = journey.route.features[0].geometry.coordinates;
    const terrainProvider = providerRegistry.getTerrainProvider();
    const elevationData = await cached(`journey-elevation:${journeyId}`, 86400, () => terrainProvider.getRouteElevation(
      journeyId,
      coords,
      journey.liveStatus.completionPercentage
    ));

    return NextResponse.json(
      { data: elevationData },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error in elevation API:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Elevation data unavailable for this route.",
        },
      },
      { status: 500 }
    );
  }
}
