import { NextRequest, NextResponse } from "next/server";
import { providerRegistry } from "@/lib/providers/registry";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    // Format can be {trainNumber}-{serviceDate} or trainNumber directly
    const trainNumber = shareId.split("-")[0];

    const trainProvider = providerRegistry.getTrainProvider();
    const journey = await trainProvider.getJourney(trainNumber);

    if (!journey) {
      return NextResponse.json(
        { error: { code: "JOURNEY_NOT_FOUND", message: "Shared journey not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          shareId,
          journeyId: journey.id,
          trainNumber: journey.train.number,
          trainName: journey.train.name,
          serviceDate: journey.serviceDate,
          liveStatus: journey.liveStatus,
          route: journey.route,
          stations: journey.stations,
          createdAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Error in shared journey API:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Shared journey information unavailable.",
        },
      },
      { status: 500 }
    );
  }
}
