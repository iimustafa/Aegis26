export type Scorer = {
  team?: string;
  player?: string;
};

export type Prediction = {
  model_type?: string;
  team1?: string;
  team2?: string;
  team1_win_probability?: number;
  team2_win_probability?: number;
  team1_goals?: number;
  team2_goals?: number;
  score?: string;
  winner?: string;
  confidence?: number;
  scorers?: Scorer[];
  top_scorer_1?: string;
  top_scorer_2?: string;
};

export type Analytics = {
  team?: string;
  total_matches?: number;
  cities?: Record<string, number>;
  stadiums?: Record<string, number>;
  countries?: Record<string, number>;
  match_days?: string[];
  estimated_total?: number;
  budget?: number;
  remaining?: number;
  is_possible?: boolean;
  budget_usage_pct?: number;
  flight_cost?: number;
  hotel_cost?: number;
  ticket_cost?: number;
  food_transport?: number;
  departure_airport?: string;
  destination_airport?: string;
};

export type TravelResponse = {
  result: string;
  analytics?: Analytics;
  prediction?: Prediction;
  thread_id?: string;
  error?: string;
};

export type TravelRequest = {
  query: string;
  thread_id?: string;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function planTrip(
  payload: TravelRequest
): Promise<TravelResponse> {
  try {
    const response = await fetch(`${API_BASE}/travel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as TravelResponse;

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch backend"
    );
  }
}