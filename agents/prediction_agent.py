import random
import joblib
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "ml_models"

model = joblib.load(MODEL_DIR / "winner_model.joblib")
features = joblib.load(MODEL_DIR / "winner_features.joblib")
team_stats = joblib.load(MODEL_DIR / "team_stats.joblib")


PLAYER_POOL = {
    "Portugal": ["Cristiano Ronaldo", "Bruno Fernandes", "Bernardo Silva", "João Félix"],
    "Brazil": ["Vinícius Júnior", "Rodrygo", "Neymar", "Richarlison"],
    "Argentina": ["Lionel Messi", "Lautaro Martínez", "Julián Álvarez"],
    "France": ["Kylian Mbappé", "Antoine Griezmann", "Ousmane Dembélé"],
    "Saudi Arabia": ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saleh Al-Shehri"],
    "Iraq": ["Aymen Hussein", "Ali Jasim", "Ibrahim Bayesh"],
    "Uruguay": ["Darwin Núñez", "Federico Valverde", "Luis Suárez"],
    "Spain": ["Álvaro Morata", "Pedri", "Lamine Yamal"],
    "England": ["Harry Kane", "Bukayo Saka", "Jude Bellingham"],
    "Germany": ["Kai Havertz", "Jamal Musiala", "Florian Wirtz"],
    "DR Congo": ["Cédric Bakambu", "Yoane Wissa"],
    "Uzbekistan": ["Eldor Shomurodov"],
    "Colombia": ["Luis Díaz", "James Rodríguez"],
    "Norway": ["Erling Haaland", "Martin Ødegaard"],
    "Morocco": ["Achraf Hakimi", "Youssef En-Nesyri", "Hakim Ziyech"],
    "Japan": ["Takefusa Kubo", "Kaoru Mitoma", "Takumi Minamino"],
}


def get_primary_match(match_info: dict):
    if match_info.get("mode") == "team_matches":
        return match_info.get("primary_match") or match_info.get("matches", [{}])[0]

    return match_info


def get_team_row(team_name: str):
    if "team_name" not in team_stats.columns:
        return None

    row = team_stats[
        team_stats["team_name"].astype(str).str.lower() == team_name.lower()
    ]

    if row.empty:
        return None

    return row.iloc[0]


def build_team_features(team_name: str):
    row = get_team_row(team_name)

    if row is None:
        return None

    data = {}

    for feature in features:
        value = row.get(feature, 0)
        data[feature] = pd.to_numeric(value, errors="coerce")

    X = pd.DataFrame([data]).fillna(0)

    return X[features]


def predict_team_strength(team_name: str):
    X = build_team_features(team_name)

    if X is None:
        return 0.5

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)[0]

        if 1 in model.classes_:
            idx = list(model.classes_).index(1)
            return float(probs[idx])

        return float(max(probs))

    return float(model.predict(X)[0])


def get_scorer(team_name: str):
    players = PLAYER_POOL.get(
        team_name,
        [f"{team_name} Forward", f"{team_name} Midfielder"]
    )

    return random.choice(players)


def generate_score_and_scorers(team1, team2, p1, p2):
    if abs(p1 - p2) < 0.08:
        goals1 = random.choice([0, 1, 1, 2])
        goals2 = goals1
        winner = "Draw"

    elif p1 > p2:
        goals1 = random.choice([1, 2, 2, 3])
        goals2 = random.choice([0, 1])
        winner = team1

    else:
        goals1 = random.choice([0, 1])
        goals2 = random.choice([1, 2, 2, 3])
        winner = team2

    scorers = []

    for _ in range(goals1):
        scorers.append({
            "team": team1,
            "player": get_scorer(team1)
        })

    for _ in range(goals2):
        scorers.append({
            "team": team2,
            "player": get_scorer(team2)
        })

    return goals1, goals2, winner, scorers


def prediction_node(state):
    match_info = state.get("match_info", {})

    if match_info.get("mode") == "invalid_fixture":
        return {
            "prediction": {
                "available": False,
                "message": match_info.get("message", "Invalid fixture. ML only works on real World Cup 2026 fixtures.")
            }
        }

    primary = get_primary_match(match_info)

    team1 = primary.get("team1", "Team A")
    team2 = primary.get("team2", "Team B")

    p1_raw = predict_team_strength(team1)
    p2_raw = predict_team_strength(team2)

    total = p1_raw + p2_raw

    if total == 0:
        p1 = 0.5
        p2 = 0.5
    else:
        p1 = p1_raw / total
        p2 = p2_raw / total

    goals1, goals2, winner, scorers = generate_score_and_scorers(
        team1,
        team2,
        p1,
        p2
    )

    confidence = round(max(p1, p2) * 100, 1)

    prediction = {
        "model_type": "RandomForestClassifier trained on FIFA team stats",
        "team1": team1,
        "team2": team2,
        "team1_win_probability": round(p1 * 100, 1),
        "team2_win_probability": round(p2 * 100, 1),
        "team1_goals": goals1,
        "team2_goals": goals2,
        "score": f"{team1} {goals1} - {goals2} {team2}",
        "winner": winner,
        "confidence": confidence,
        "scorers": scorers,
        "top_scorer_1": scorers[0]["player"] if len(scorers) > 0 else "No scorer predicted",
        "top_scorer_2": scorers[1]["player"] if len(scorers) > 1 else "No second scorer predicted"
    }

    return {
        "prediction": prediction
    }