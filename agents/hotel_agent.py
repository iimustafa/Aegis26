from tools.tavily_tool import tavily_search

def hotel_node(state):
    query = state["query"]

    results = tavily_search(
        f"cheap hostels budget hotels FIFA World Cup 2026 Miami Mexico City Toronto Dallas Saudi fans {query}"
    )

    return {
        "hotels": results
    }