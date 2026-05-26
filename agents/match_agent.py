import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

with open(DATA_DIR / "worldcup.json", "r", encoding="utf-8") as f:
    WORLDCUP = json.load(f)

with open(DATA_DIR / "team.json", "r", encoding="utf-8") as f:
    TEAMS = json.load(f)

with open(DATA_DIR / "stadiums.json", "r", encoding="utf-8") as f:
    STADIUMS = json.load(f)["stadiums"]


def build_team_aliases():
    aliases = {}

    for team in TEAMS:
        name = team.get("name", "")
        normalized = team.get("name_normalised", "")
        code = team.get("fifa_code", "")

        if name:
            aliases[name.lower()] = name
        if normalized:
            aliases[normalized.lower()] = name
        if code:
            aliases[code.lower()] = name

    aliases.update({
        "ksa": "Saudi Arabia",
        "saudi": "Saudi Arabia",
        "saudi arabia": "Saudi Arabia",
        "السعودية": "Saudi Arabia",
        "السعودي": "Saudi Arabia",
        "المنتخب السعودي": "Saudi Arabia",
        "اسبانيا": "Spain",
        "إسبانيا": "Spain",
        "اوروغواي": "Uruguay",
        "أوروغواي": "Uruguay",
        "الرأس الأخضر": "Cape Verde",
        "كاب فيردي": "Cape Verde",
        "البرازيل": "Brazil",
        "البرتغال": "Portugal",
        "برتغال": "Portugal",
    })

    return aliases


TEAM_ALIASES = build_team_aliases()


def user_text(query: str):
    q = query.lower()
    cut = len(q)

    for marker in ["departure city:", "budget:", "trip style:", "match preference:"]:
        idx = q.find(marker)
        if idx != -1:
            cut = min(cut, idx)

    return q[:cut].strip()


def detect_teams(query: str):
    q = user_text(query)
    found = []

    for key in sorted(TEAM_ALIASES.keys(), key=len, reverse=True):
        if key in q:
            team = TEAM_ALIASES[key]
            if team not in found:
                found.append(team)

    return found


def get_stadium(city_name):
    for s in STADIUMS:
        city = s.get("city", "").lower()
        ground = city_name.lower()

        if city == ground or ground in city or city in ground:
            return s

    return None


def format_match(match, index):
    stadium = get_stadium(match.get("ground", ""))

    return {
        "index": index,
        "round": match.get("round", "Unknown"),
        "date": match.get("date", "Unknown"),
        "time": match.get("time", "Unknown"),
        "team1": match.get("team1", "Unknown"),
        "team2": match.get("team2", "Unknown"),
        "group": match.get("group", "Unknown"),
        "city": match.get("ground", "Unknown"),
        "stadium": stadium["name"] if stadium else match.get("ground", "Unknown"),
        "capacity": stadium["capacity"] if stadium else "Unknown",
        "country": stadium["cc"] if stadium else "Unknown",
        "coords": stadium["coords"] if stadium else "Unknown",
        "match": f"{match.get('team1')} vs {match.get('team2')}",
    }


def find_team_matches(team):
    selected = []

    for i, m in enumerate(WORLDCUP["matches"], start=1):
        if m.get("team1") == team or m.get("team2") == team:
            selected.append(format_match(m, i))

    return selected


def find_head_to_head(team_a, team_b):
    for i, m in enumerate(WORLDCUP["matches"], start=1):
        teams = {m.get("team1"), m.get("team2")}

        if team_a in teams and team_b in teams:
            return format_match(m, i)

    return None


def extract_match_number(query):
    q = user_text(query)

    ordinals = {
        "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5,
        "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9, "tenth": 10,
        "الأولى": 1, "الاولى": 1, "الثانية": 2, "الثالثة": 3,
        "الرابعة": 4, "الخامسة": 5, "السادسة": 6, "السابعة": 7,
        "الثامنة": 8, "التاسعة": 9, "العاشرة": 10,
    }

    for word, number in ordinals.items():
        if word in q:
            return number

    for pattern in [r"match\s+(\d+)", r"game\s+(\d+)", r"المباراة\s+(\d+)"]:
        m = re.search(pattern, q)
        if m:
            return int(m.group(1))

    return None


def match_node(state):
    query = state["query"]
    matches = WORLDCUP["matches"]
    teams = detect_teams(query)

    # User selected specific real fixture: KSA vs Spain
    if len(teams) >= 2:
        selected = find_head_to_head(teams[0], teams[1])

        if selected:
            return {
                "match_info": {
                    "mode": "single_match",
                    "is_valid_fixture": True,
                    **selected,
                }
            }

        return {
            "match_info": {
                "mode": "invalid_fixture",
                "is_valid_fixture": False,
                "team1": teams[0],
                "team2": teams[1],
                "message": f"{teams[0]} vs {teams[1]} is not a real FIFA World Cup 2026 fixture in the dataset.",
            }
        }

    # User selected team: KSA matches
    if len(teams) == 1:
        selected_matches = find_team_matches(teams[0])

        return {
            "match_info": {
                "mode": "team_matches",
                "is_valid_fixture": True,
                "team": teams[0],
                "matches": selected_matches,
                "primary_match": selected_matches[0] if selected_matches else None,
            }
        }

    # User selected match number
    match_number = extract_match_number(query)

    if match_number and 1 <= match_number <= len(matches):
        selected = format_match(matches[match_number - 1], match_number)

        return {
            "match_info": {
                "mode": "single_match",
                "is_valid_fixture": True,
                **selected,
            }
        }

    selected = format_match(matches[0], 1)

    return {
        "match_info": {
            "mode": "single_match",
            "is_valid_fixture": True,
            **selected,
        }
    }