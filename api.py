from fastapi import FastAPI
from pydantic import BaseModel
from main import app

api = FastAPI()

class Request(BaseModel):
    query: str


@api.post("/travel")
def travel(req: Request):

    result = app.invoke({
        "messages": [],
        "user_query": req.query,
        "flight_results": "",
        "hotel_results": "",
        "raw_plan": "",
        "optimized_plan": "",
        "budget": 10000
    })

    return {
        "result": result["optimized_plan"]
    }