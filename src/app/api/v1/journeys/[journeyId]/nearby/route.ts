import { NextRequest, NextResponse } from "next/server";
import { providerRegistry } from "@/lib/providers/registry";
import { cached, enforceRateLimit } from "@/lib/production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await params;
    const limited = enforceRateLimit(request, "journey-nearby", 30);
    if (limited) return limited;
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    let lat = latParam ? parseFloat(latParam) : null;
    let lng = lngParam ? parseFloat(lngParam) : null;

    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      const trainProvider = providerRegistry.getTrainProvider();
      const journey = await cached(`journey-route:${journeyId}`, 900, () => trainProvider.getJourney(journeyId));
      if (journey) {
        lat = journey.liveStatus.position.lat;
        lng = journey.liveStatus.position.lng;
      } else {
        lat = 12.97;
        lng = 79.13;
      }
    }

    const geoProvider = providerRegistry.getGeoProvider();
    const geography = await cached(`journey-nearby:${journeyId}:${lat.toFixed(3)}:${lng.toFixed(3)}`, 3600, () => geoProvider.getNearbyFeatures(lat, lng, 25));

    return NextResponse.json(
      { data: geography },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Error in nearby geography API:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Nearby geographical context unavailable.",
        },
      },
      { status: 500 }
    );
  }
}
