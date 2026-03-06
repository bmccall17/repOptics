// Port.io API client — fetches entities and scorecards from the Port catalog

export type PortEntity = {
  identifier: string;
  title: string;
  blueprint: string;
  properties: Record<string, unknown>;
  relations: Record<string, unknown>;
  scorecards: Record<
    string,
    { level: string; rules: { identifier: string; status: string }[] }
  >;
};

export type PortScorecardLevel = "Basic" | "Bronze" | "Silver" | "Gold";

export type PortScorecard = {
  identifier: string;
  title: string;
  blueprint: string;
  rules: {
    identifier: string;
    title: string;
    level: PortScorecardLevel;
    query: Record<string, unknown>;
  }[];
  levels: PortScorecardLevel[];
};

async function getPortToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const res = await fetch(
    "https://api.getport.io/v1/auth/access_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    }
  );
  if (!res.ok) throw new Error(`Port auth failed: ${res.status}`);
  const data = await res.json();
  return data.accessToken;
}

export async function getPortEntities(
  clientId: string,
  clientSecret: string,
  blueprint: string = "githubRepository"
): Promise<PortEntity[]> {
  const token = await getPortToken(clientId, clientSecret);
  const res = await fetch(
    `https://api.getport.io/v1/blueprints/${blueprint}/entities?exclude_calculated_properties=false`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Port entities fetch failed: ${res.status}`);
  const data = await res.json();
  return data.entities ?? [];
}

export async function getPortScorecards(
  clientId: string,
  clientSecret: string,
  blueprint: string = "githubRepository"
): Promise<PortScorecard[]> {
  const token = await getPortToken(clientId, clientSecret);
  const res = await fetch(
    `https://api.getport.io/v1/blueprints/${blueprint}/scorecards`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Port scorecards fetch failed: ${res.status}`);
  const data = await res.json();
  return data.scorecards ?? [];
}
