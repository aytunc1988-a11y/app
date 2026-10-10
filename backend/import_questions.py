"""Importiert die Seed-Fragen in MongoDB (Collection e_Question).

Aufruf im Ordner /app/backend:
    python import_questions.py --dry-run   # nur zählen, nichts schreiben
    python import_questions.py             # wirklich importieren

Das Skript ist wiederholbar: Fragen, die es schon gibt (gleiches Fach + gleicher
Fragetext), werden übersprungen. Alte Fragen ohne Feld "profession" bekommen
"kaufmann".
"""
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

from seed_data import SEED_QUESTIONS
from seed_questions_kaufmann_bilder import KAUFMANN_BILD_QUESTIONS
load_dotenv(Path(__file__).parent / ".env")

DRY = "--dry-run" in sys.argv
DEFAULT_PROFESSION = "kaufmann"

client = MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
db = client[os.environ.get("DB_NAME", "test_database")]
col = db["e_Question"]  # server.py: coll(name) = db["e_" + name]

# 1) Alte Fragen ohne Beruf ergänzen
missing = col.count_documents({"profession": {"$exists": False}})
print(f"Fragen in DB ohne 'profession': {missing}")
if missing and not DRY:
    col.update_many({"profession": {"$exists": False}}, {"$set": {"profession": DEFAULT_PROFESSION}})

# 2) Neue Fragen einfügen
existing = {(d.get("subject"), d.get("question")) for d in col.find({}, {"subject": 1, "question": 1})}
now = datetime.now(timezone.utc).isoformat()
new_docs = []
ALL_SEED_QUESTIONS = list(SEED_QUESTIONS) + list(KAUFMANN_BILD_QUESTIONS)

for q in ALL_SEED_QUESTIONS:
    key = (q["subject"], q["question"])
    if key in existing:
        continue
    existing.add(key)
    new_docs.append({
        "id": str(uuid.uuid4()),
        "created_by_id": "seed",
        "created_by": "seed",
        "created_date": now,
        **q,
        "profession": q.get("profession", DEFAULT_PROFESSION),
    })

print(f"Fragen in Seed-Datei: {len(ALL_SEED_QUESTIONS)}")
print(f"Neu einzufügen:       {len(new_docs)}")
if new_docs and not DRY:
    col.insert_many(new_docs)
    print("Fertig, eingefügt.")
elif DRY:
    print("Dry-run: nichts geschrieben.")
print(f"Fragen in DB jetzt:   {col.count_documents({})}" if not DRY else "")
