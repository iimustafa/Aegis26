def final_node(state):

    match_info = state.get("match_info", {})
    flight_info = state.get("flight_info", {})
    hotel_info = state.get("hotel_info", {})
    budget_info = state.get("budget_info", {})

    # =========================
    # TEAM MATCHES MODE
    # =========================

    if match_info.get("mode") == "team_matches":

        matches_text = ""

        for m in match_info.get("matches", []):

            matches_text += f"""
🏟 {m.get("stadium")}
📍 {m.get("city")}
📅 {m.get("date")}
⏰ {m.get("time")}
⚔️ {m.get("team1")} vs {m.get("team2")}

"""

        final_text = f"""
✈️ FIFA 2026 Travel Plan

🌍 Team Selected
{match_info.get("team")}

⚽ Matches Found
{len(match_info.get("matches", []))} matches

{matches_text}

🛫 Flights
{flight_info.get("summary", "Flight data unavailable")}

🏨 Hotels
{hotel_info.get("summary", "Hotel data unavailable")}

💰 Budget
{budget_info.get("summary", "Budget data unavailable")}

✅ Final Verdict
Trip planning completed successfully.
"""

        return {
            **state,
            "final_answer": final_text
        }

    # =========================
    # SINGLE MATCH MODE
    # =========================

    final_text = f"""
✈️ FIFA 2026 Travel Plan

🌍 Destination
{match_info.get("city", "Unknown")}

⚽ Match Details
🏟 {match_info.get("stadium", "Unknown")}
📅 {match_info.get("date", "Unknown")}
⏰ {match_info.get("time", "Unknown")}
⚔️ {match_info.get("match", "Unknown")}

🛫 Flights
{flight_info.get("summary", "Flight data unavailable")}

🏨 Hotels
{hotel_info.get("summary", "Hotel data unavailable")}

💰 Budget
{budget_info.get("summary", "Budget data unavailable")}

✅ Final Verdict
Trip planning completed successfully.
"""

    return {
        **state,
        "final_answer": final_text
    }