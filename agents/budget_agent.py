def budget_node(state):

    ticket_info = state.get("ticket_info", {})
    flights = state.get("flights", {})

    hotel_cost = 1800
    food_cost = 1200

    flight_cost = 2500

    ticket_cost = ticket_info.get("price", 700)

    total = (
        flight_cost
        + hotel_cost
        + ticket_cost
        + food_cost
    )

    budget = 10000

    remaining = budget - total

    return {
        "budget_plan": {

            "flights_cost": flight_cost,

            "hotel_cost": hotel_cost,

            "ticket_cost": ticket_cost,

            "food_cost": food_cost,

            "total_cost": total,

            "budget": budget,

            "remaining": remaining,

            "is_possible": remaining >= 0
        }
    }