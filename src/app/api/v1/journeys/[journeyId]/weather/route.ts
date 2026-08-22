import { NextRequest, NextResponse } from "next/server";
import { providerRegistry } from "@/lib/providers/registry";
import { cached, enforceRateLimit } from "@/lib/production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await params;
    const limited = enforceRateLimit(request, "journey-weather", 30);
    if (limited) return limited;
    const trainProvider = providerRegistry.getTrainProvider();
    const journey = await cached(`journey-route:${journeyId}`, 900, () => trainProvider.getJourney(journeyId));

    if (!journey) {
      return NextResponse.json(
        { error: { code: "JOURNEY_NOT_FOUND", message: "Journey not found" } },
        { status: 404 }
      );
    }

    const checkpoints = journey.stations.map((st) => ({
      id: st.station.id || st.station.code,
      name: st.station.name,
      coordinates: {
        lat: st.station.latitude,
        lng: st.station.longitude,
      },
      distanceKm: st.distanceFromOriginKm,
    }));

    const weatherProvider = providerRegistry.getWeatherProvider();
    const weather = await cached(`journey-weather:${journeyId}`, 900, async () => {
      const routeWeather = await weatherProvider.getRouteWeather(journeyId, checkpoints);
      const currentLat = journey.liveStatus.currentStation?.latitude || journey.liveStatus.position.lat;
      const currentLng = journey.liveStatus.currentStation?.longitude || journey.liveStatus.position.lng;
      const currentName = journey.liveStatus.currentStation?.name || "Current Location";
      const nextLat = journey.liveStatus.nextStation?.latitude || journey.destination.latitude;
      const nextLng = journey.liveStatus.nextStation?.longitude || journey.destination.longitude;
      const nextName = journey.liveStatus.nextStation?.name || journey.destination.name;
      const [currentStation, nextStation, destination] = await Promise.all([
        weatherProvider.getPointWeather(currentLat, currentLng, currentName),
        weatherProvider.getPointWeather(nextLat, nextLng, nextName),
        weatherProvider.getPointWeather(journey.destination.latitude, journey.destination.longitude, journey.destination.name),
      ]);
      return { currentStation, nextStation, destination, checkpoints: routeWeather };
    });

    return NextResponse.json(
      {
        data: {
          ...weather,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Error in journey weather API:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Weather data currently unavailable.",
        },
      },
      { status: 500 }
    );
  }
}
