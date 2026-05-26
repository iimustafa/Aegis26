import streamlit as st
import requests
import uuid
import pandas as pd

st.set_page_config(
    page_title="AI Travel Planner",
    page_icon="✈️",
    layout="wide"
)

API_URL = "http://127.0.0.1:8000/travel"

if "messages" not in st.session_state:
    st.session_state.messages = []

if "thread_id" not in st.session_state:
    st.session_state.thread_id = str(uuid.uuid4())

if "latest_analytics" not in st.session_state:
    st.session_state.latest_analytics = {}

with st.sidebar:
    st.title("⚙️ Trip Controls")

    budget = st.slider("Budget (SAR)", 5000, 50000, 10000, 500)

    origin = st.selectbox(
        "Departure City",
        ["Dammam", "Riyadh", "Jeddah", "Khobar", "Madinah", "Abha", "Tabuk"]
    )

    trip_style = st.selectbox("Trip Style", ["Budget", "Balanced", "Comfort"])

    matches = st.selectbox(
        "Matches",
        ["Auto detect", "Saudi Arabia match", "Opening match", "As many as possible"]
    )

    if st.button("🧹 Clear Chat"):
        st.session_state.messages = []
        st.session_state.thread_id = str(uuid.uuid4())
        st.session_state.latest_analytics = {}
        st.rerun()

st.title("✈️ AI Travel Planner")
st.caption("FIFA 2026 Multi-Agent Travel Planner + Analytics Dashboard")

col1, col2, col3 = st.columns(3)
col1.metric("💰 Budget", f"{budget:,} SAR")
col2.metric("📍 From", origin)
col3.metric("⚽ Goal", matches)

left, right = st.columns([2, 1])

with left:
    st.subheader("💬 Travel Chat")

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    user_input = st.chat_input("Ask me to plan or modify your trip...")

    if user_input:
        extra_context = f"""
Departure city: {origin}
Budget: {budget} SAR
Trip style: {trip_style}
"""

        if matches != "Auto detect":
            extra_context += f"\nMatch preference: {matches}"

        full_query = f"""
{user_input}

{extra_context}
"""

        st.session_state.messages.append({"role": "user", "content": user_input})

        with st.chat_message("user"):
            st.markdown(user_input)

        with st.chat_message("assistant"):
            with st.status("Planning and analyzing your FIFA trip...", expanded=True) as status:
                st.write("⚽ Reading match dataset...")
                st.write("🎟️ Estimating ticket cost...")
                st.write("✈️ Searching flight context...")
                st.write("🏨 Searching hotel context...")
                st.write("💰 Optimizing budget...")
                st.write("📊 Building analytics dashboard...")

                try:
                    res = requests.post(
                        API_URL,
                        json={
                            "query": full_query,
                            "thread_id": st.session_state.thread_id
                        },
                        timeout=180
                    )

                    data = res.json()

                    if "error" in data:
                        answer = f"Backend error: {data['error']}"
                        st.error(answer)
                    else:
                        answer = data["result"]
                        st.session_state.latest_analytics = data.get("analytics", {})
                        status.update(label="Trip plan and analytics ready", state="complete")
                        st.markdown(answer)

                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": answer
                    })

                except Exception as e:
                    answer = f"Request failed: {str(e)}"
                    st.error(answer)

with right:
    st.subheader("📊 Analytics Dashboard")

    a = st.session_state.latest_analytics

    if a:
        c1, c2 = st.columns(2)

        c1.metric("Matches", a.get("total_matches", 0))
        c2.metric("Budget Usage", f"{a.get('budget_usage_pct', 0)}%")

        st.metric("Estimated Total", f"{a.get('estimated_total', 0):,} SAR")
        st.metric("Remaining", f"{a.get('remaining', 0):,} SAR")

        usage = min(a.get("budget_usage_pct", 0) / 100, 1)
        st.progress(usage)

        st.divider()

        st.subheader("💰 Cost Breakdown")

        cost_df = pd.DataFrame({
            "Category": ["Flights", "Hotel", "Ticket", "Food & Transport"],
            "Cost": [
                a.get("flight_cost", 0),
                a.get("hotel_cost", 0),
                a.get("ticket_cost", 0),
                a.get("food_transport", 0),
            ]
        })

        st.bar_chart(cost_df.set_index("Category"))

        st.divider()

        st.subheader("🏙️ Cities Distribution")

        cities = a.get("cities", {})
        if cities:
            city_df = pd.DataFrame(
                list(cities.items()),
                columns=["City", "Matches"]
            )
            st.dataframe(city_df, use_container_width=True)
            st.bar_chart(city_df.set_index("City"))

        st.divider()

        st.subheader("🏟️ Stadiums")

        stadiums = a.get("stadiums", {})
        if stadiums:
            stadium_df = pd.DataFrame(
                list(stadiums.items()),
                columns=["Stadium", "Matches"]
            )
            st.dataframe(stadium_df, use_container_width=True)

    else:
        st.info("Analytics will appear after generating a trip.")

st.caption("Built with LangGraph + Ollama + Tavily + Structured FIFA datasets")