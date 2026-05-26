def planner_node(state):
    match_info = state.get("match_info", {})
    ticket_info = state.get("ticket_info", {})
    flights = state.get("flights", {})
    hotels = state.get("hotels", "")
    budget = state.get("budget_plan", {})
    prediction = state.get("prediction", {})

    output = []

    output.append("✈️ FIFA 2026 Travel Plan\n")

    output.append("🌍 Team / Match Selected")

    if match_info.get("mode") == "invalid_fixture":
        return {
        "result": f"""
# ❌ Invalid Fixture

{match_info.get("message")}

ML prediction is disabled because this match is not part of the real FIFA World Cup 2026 fixture list.

Try one of the real Saudi Arabia fixtures:
- Saudi Arabia vs Uruguay
- Spain vs Saudi Arabia
- Cape Verde vs Saudi Arabia
"""
    }   

    if match_info.get("mode") == "team_matches":
        output.append(match_info.get("team", "Unknown"))
    else:
        output.append(
            f"{match_info.get('team1', 'Unknown')} vs {match_info.get('team2', 'Unknown')}"
        )

    output.append("\n⚽ Official Matches")

    if match_info.get("mode") == "team_matches":
        for match in match_info.get("matches", []):
            output.append(
                f"""
🏟 Stadium: {match.get('stadium')}
📍 City: {match.get('city')}
📅 Date: {match.get('date')}
⏰ Time: {match.get('time')}
⚔️ Match: {match.get('team1')} vs {match.get('team2')}
🏆 Round: {match.get('round')}
"""
            )
    else:
        output.append(
            f"""
🏟 Stadium: {match_info.get('stadium')}
📍 City: {match_info.get('city')}
📅 Date: {match_info.get('date')}
⏰ Time: {match_info.get('time')}
⚔️ Match: {match_info.get('team1')} vs {match_info.get('team2')}
🏆 Round: {match_info.get('round')}
"""
        )

    output.append("\n🎟️ Ticket Information")
    output.append(
        f"""
Ticket estimate: {ticket_info.get('price', ticket_info.get('price_sar', 'Unknown'))} SAR
Availability: {ticket_info.get('availability', 'Official FIFA ticket estimate')}
"""
    )

    output.append("\n🛫 Flight Information")
    output.append(
        f"""
From: {flights.get('origin_city', flights.get('departure_city', 'Unknown'))} ({flights.get('origin_airport', flights.get('departure_airport', ''))})
To: {flights.get('destination_city', 'Unknown')} ({flights.get('destination_airport', '')})
"""
    )
    output.append(flights.get("results", ""))

    output.append("\n🏨 Hotel Information\n")
    output.append(hotels)

    output.append("\n📊 AI Match Prediction\n")

    if prediction:
        output.append(
            f"""
🏆 Predicted Winner: {prediction.get('winner')}

⚽ Expected Goals:
- {prediction.get('team1')}: {prediction.get('team1_goals')}
- {prediction.get('team2')}: {prediction.get('team2_goals')}

🔥 Expected Top Scorers:
- {prediction.get('top_scorer_1')}
- {prediction.get('top_scorer_2')}

📈 Confidence:
{prediction.get('confidence')}%
"""
        )
    else:
        output.append("Prediction unavailable")

    output.append("\n💰 Budget Plan")
    output.append(
        f"""
Flights: {budget.get('flights_cost', 0)} SAR
Hotel: {budget.get('hotel_cost', 0)} SAR
Match Ticket: {budget.get('ticket_cost', 0)} SAR
Food & Transport: {budget.get('food_cost', budget.get('food_transport', 0))} SAR

Total: {budget.get('total_cost', budget.get('total', 0))} SAR
Budget: {budget.get('budget', 10000)} SAR
Remaining: {budget.get('remaining', 0)} SAR

Status: {"Possible ✅" if budget.get("is_possible") else "Over Budget ❌"}
"""
    )

    output.append("\n✅ Final Verdict")

    if budget.get("is_possible"):
        output.append("Trip is possible within budget.")
    else:
        output.append("Trip exceeds the selected budget.")

    return {
        "result": "\n".join(output)
    }