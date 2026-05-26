from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from pathlib import Path
import uuid
import json

from agents.match_agent import match_node
from agents.prediction_agent import prediction_node
from agents.ticket_agent import ticket_node
from agents.flight_agent import flight_node
from agents.hotel_agent import hotel_node
from agents.budget_agent import budget_node
from agents.analytics_agent import analytics_node
from agents.planner_agent import planner_node

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent / "data"


class TravelState(TypedDict):
    query: str
    match_info: dict
    prediction: dict
    ticket_info: dict
    flights: dict
    hotels: str
    budget_plan: dict
    analytics: dict
    result: str


class TravelRequest(BaseModel):
    query: str
    thread_id: Optional[str] = None


graph = StateGraph(TravelState)

graph.add_node("matches", match_node)
graph.add_node("prediction", prediction_node)
graph.add_node("tickets", ticket_node)
graph.add_node("flights", flight_node)
graph.add_node("hotels", hotel_node)
graph.add_node("budget", budget_node)
graph.add_node("analytics", analytics_node)
graph.add_node("planner", planner_node)

graph.set_entry_point("matches")
graph.add_edge("matches", "prediction")
graph.add_edge("prediction", "tickets")
graph.add_edge("tickets", "flights")
graph.add_edge("flights", "hotels")
graph.add_edge("hotels", "budget")
graph.add_edge("budget", "analytics")
graph.add_edge("analytics", "planner")
graph.add_edge("planner", END)

compiled = graph.compile()


@app.post("/travel")
def travel(req: TravelRequest):
    try:
        thread_id = req.thread_id or str(uuid.uuid4())

        result = compiled.invoke(
            {"query": req.query},
            config={"configurable": {"thread_id": thread_id}},
        )

        return {
            "result": result.get("result", ""),
            "analytics": result.get("analytics", {}),
            "prediction": result.get("prediction", {}),
            "thread_id": thread_id,
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/fixtures/teams")
def get_fixture_teams():
    with open(DATA_DIR / "worldcup.json", "r", encoding="utf-8") as f:
        worldcup = json.load(f)

    teams = set()

    for match in worldcup["matches"]:
        teams.add(match["team1"])
        teams.add(match["team2"])

    return {"teams": sorted(list(teams))}


@app.get("/fixtures/opponents/{team_name}")
def get_team_opponents(team_name: str):
    with open(DATA_DIR / "worldcup.json", "r", encoding="utf-8") as f:
        worldcup = json.load(f)

    opponents = []

    for match in worldcup["matches"]:
        team1 = match["team1"]
        team2 = match["team2"]

        if team1.lower() == team_name.lower():
            opponents.append({
                "opponent": team2,
                "match": match,
            })

        elif team2.lower() == team_name.lower():
            opponents.append({
                "opponent": team1,
                "match": match,
            })

    return {
        "team": team_name,
        "opponents": opponents,
    }


@app.get("/")
def home():
    return {
        "status": "AI Travel Planner + Analytics + ML Prediction Backend Running"
    }