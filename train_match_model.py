import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "ml_models"
MODEL_DIR.mkdir(exist_ok=True)

TRAIN_PATH = BASE_DIR / "data" / "train.csv"
TEST_PATH = BASE_DIR / "data" / "test.csv"

train = pd.read_csv(TRAIN_PATH)
test = pd.read_csv(TEST_PATH)

train.columns = [c.strip().lower() for c in train.columns]
test.columns = [c.strip().lower() for c in test.columns]

target = "winner"

drop_cols = ["team_name", "country_code", target]

candidate_features = [c for c in train.columns if c not in drop_cols]

# keep numeric only
features = []

for col in candidate_features:
    train[col] = pd.to_numeric(train[col], errors="coerce")

    if col in test.columns:
        test[col] = pd.to_numeric(test[col], errors="coerce")

    if train[col].notna().sum() > 0:
        features.append(col)

X = train[features].fillna(0)

y = train[target]

# normalize target
if y.dtype == "object":
    y = y.astype(str).str.lower().map({
        "1": 1,
        "yes": 1,
        "true": 1,
        "winner": 1,
        "win": 1,
        "0": 0,
        "no": 0,
        "false": 0,
        "lose": 0,
        "loss": 0
    }).fillna(0).astype(int)

X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

pred = model.predict(X_val)
acc = accuracy_score(y_val, pred)

all_teams = pd.concat(
    [train.drop(columns=[target], errors="ignore"), test],
    ignore_index=True
)

all_teams.columns = [c.strip().lower() for c in all_teams.columns]

for col in features:
    if col not in all_teams.columns:
        all_teams[col] = 0
    all_teams[col] = pd.to_numeric(all_teams[col], errors="coerce").fillna(0)

all_teams = all_teams.drop_duplicates(subset=["team_name"], keep="last")

joblib.dump(model, MODEL_DIR / "winner_model.joblib")
joblib.dump(features, MODEL_DIR / "winner_features.joblib")
joblib.dump(all_teams, MODEL_DIR / "team_stats.joblib")

print("✅ Winner model trained")
print("Accuracy:", round(acc, 3))
print("Features:", features)
print("Saved to:", MODEL_DIR)