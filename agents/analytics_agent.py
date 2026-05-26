from collections import Counter, defaultdict

def analytics_node(state):
    match_info = state.get("match_info", {})
    budget = state.get("budget_plan", {})
    flights = state.get("flights", {})

    analytics = {
        "team": match_info.get("team", "Single Match"),
        "total_matches": 0,
        "cities": [],
        "stadiums": [],
        "countries": [],
        "estimated_total": budget.get("total", 0),
        "budget": budget.get("budget", 0),
        "remaining": budget.get("remaining", 0),
        "is_possible": budget.get("is_possible", False),
        "flight_cost": budget.get("flights_cost", 0),
        "hotel_cost": budget.get("hotel_cost", 0),
        "ticket_cost": budget.get("ticket_cost", 0),
        "food_transport": budget.get("food_transport", 0),
        "departure_airport": flights.get("departure_airport", ""),
        "destination_airport": flights.get("destination_airport", ""),
    }

    if match_info.get("mode") == "team_matches":
        matches = match_info.get("matches", [])
    else:
        matches = [match_info]

    analytics["total_matches"] = len(matches)

    city_counter = Counter()
    stadium_counter = Counter()
    country_counter = Counter()
    match_days = []

    for m in matches:
        city = m.get("city", "Unknown")
        stadium = m.get("stadium", "Unknown")
        country = m.get("country", m.get("country_code", "Unknown"))
        date = m.get("date", "Unknown")

        city_counter[city] += 1
        stadium_counter[stadium] += 1
        country_counter[country] += 1
        match_days.append(date)

    analytics["cities"] = dict(city_counter)
    analytics["stadiums"] = dict(stadium_counter)
    analytics["countries"] = dict(country_counter)
    analytics["match_days"] = match_days

    if analytics["budget"]:
        analytics["budget_usage_pct"] = round(
            (analytics["estimated_total"] / analytics["budget"]) * 100,
            1
        )
    else:
        analytics["budget_usage_pct"] = 0

    return {
        "analytics": analytics
    }