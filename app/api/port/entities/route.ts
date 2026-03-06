import { NextResponse } from "next/server";
import { getPortEntities } from "@/lib/port";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blueprint = searchParams.get("blueprint") ?? "githubRepository";

  const clientId = process.env.PORT_CLIENT_ID;
  const clientSecret = process.env.PORT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Port credentials not configured" },
      { status: 503 }
    );
  }

  try {
    const entities = await getPortEntities(clientId, clientSecret, blueprint);
    return NextResponse.json({ entities });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
