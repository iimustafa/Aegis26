def ticket_node(state):

    match_info = state.get("match_info", {})

    matches = match_info.get("matches", [])

    if not matches:

        return {
            "ticket_info": {
                "price": 700,
                "availability": "Official FIFA ticket estimate"
            }
        }

    first_match = matches[0]

    round_name = first_match.get("round", "").lower()

    if "final" in round_name:
        price = 2500

    elif "semi" in round_name:
        price = 1800

    elif "quarter" in round_name:
        price = 1400

    elif "round of 16" in round_name:
        price = 1100

    else:
        price = 700

    return {
        "ticket_info": {
            "price": price,
            "availability": "Official FIFA ticket estimate"
        }
    }