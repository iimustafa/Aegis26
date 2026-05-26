from tools.flight_tool import search_flights

def flight_node(state):

    query = state["query"]

    result = search_flights(query)

    return {
        "flights": result
    }