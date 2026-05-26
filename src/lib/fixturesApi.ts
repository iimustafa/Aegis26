const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type FixtureTeamResponse = {
  teams: string[];
};

export type FixtureMatch = {
  round?: string;
  date?: string;
  time?: string;
  team1?: string;
  team2?: string;
  group?: string;
  ground?: string;
};

export type OpponentItem = {
  opponent: string;
  match: FixtureMatch;
};

export type OpponentsResponse = {
  team: string;
  opponents: OpponentItem[];
};

export async function getFixtureTeams(): Promise<FixtureTeamResponse> {
  const response = await fetch(`${API_BASE}/fixtures/teams`);

  if (!response.ok) {
    throw new Error("Failed to load fixture teams");
  }

  return response.json();
}

export async function getTeamOpponents(
  teamName: string
): Promise<OpponentsResponse> {
  const response = await fetch(
    `${API_BASE}/fixtures/opponents/${encodeURIComponent(teamName)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load team opponents");
  }

  return response.json();
}