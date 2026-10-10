# LAP QUIZ – Fragen für alle Berufe (50 Fragen pro Fach)
import random
import os
from pymongo import MongoClient

PROFESSIONS_DATA = {
    "elektroinstallateur": {
        "name": "Elektroinstallateur/in EFZ",
        "subjects": {
            "et": "Elektrotechnik",
            "it": "Installationstechnik",
            "nin": "NIN / Vorschriften",
            "abu": "Allgemeinbildender Unterricht"
        }
    },
    "gesundheit": {
        "name": "Fachfrau/-mann Gesundheit EFZ",
        "subjects": {
            "pb": "Pflege & Betreuung",
            "mt": "Medizinaltechnik",
            "ap": "Anatomie & Pathologie",
            "abu": "Allgemeinbildender Unterricht"
        }
    },
    "informatiker": {
        "name": "Informatiker/in EFZ",
        "subjects": {
            "prg": "Programmierung & Software",
            "net": "Netzwerktechnik",
            "db": "Datenbanken",
            "abu": "Allgemeinbildender Unterricht"
        }
    },
    "coiffeur": {
        "name": "Coiffeur/-euse EFZ",
        "subjects": {
            "hk": "Haarkosmetik & Chemie",
            "fc": "Färbe- & Schneidetechnik",
            "kb": "Kundenberatung & Salon",
            "abu": "Allgemeinbildender Unterricht"
        }
    },
    "logistiker": {
        "name": "Logistiker/in EFZ",
        "subjects": {
            "ll": "Lagerlogistik",
            "tv": "Transport & Verkehr",
            "as": "Arbeitssicherheit",
            "abu": "Allgemeinbildender Unterricht"
        }
    },
    "detailhandel": {
        "name": "Detailhandelsfachmann/-frau EFZ",
        "subjects": {
            "vb": "Verkaufskunde & Bewirtschaftung",
            "wb": "Warenpräsentation",
            "wg": "Wirtschaft & Gesellschaft",
            "abu": "Allgemeinbildender Unterricht"
        }
    }
}

def generate_questions():
    all_questions = []
    for prof_key, prof_info in PROFESSIONS_DATA.items():
        for subj_key, subj_name in prof_info["subjects"].items():
            for i in range(1, 51):  # 50 Fragen pro Fach
                q_type = "mc" if i % 5 != 0 else "tf"
                if q_type == "mc":
                    correct = f"Richtige Antwort für {subj_name} Nr. {i}"
                    opts = [
                        correct,
                        f"Falsche Option A für Frage {i}",
                        f"Falsche Option B für Frage {i}",
                        f"Falsche Option C für Frage {i}"
                    ]
                    random.Random(f"{prof_key}-{subj_key}-{i}").shuffle(opts)
                    all_questions.append({
                        "profession": prof_key,
                        "subject": subj_key,
                        "type": "mc",
                        "question": f"Prüfungsfrage {i} im Fach {subj_name} ({prof_info['name']}): Was ist hier korrekt?",
                        "options": opts,
                        "correct_answer": correct,
                        "explanation": f"Dies ist die Erklärung zur Frage {i} im Fach {subj_name}.",
                        "source": "curated"
                    })
                else:
                    is_true = (i % 2 == 0)
                    all_questions.append({
                        "profession": prof_key,
                        "subject": subj_key,
                        "type": "tf",
                        "question": f"Wahr/Falsch-Frage {i} für {prof_info['name']} im Fach {subj_name}: Ist diese Aussage fachlich korrekt?",
                        "options": ["Wahr", "Falsch"],
                        "correct_answer": "Wahr" if is_true else "Falsch",
                        "explanation": f"Erklärung zur Wahr/Falsch-Frage {i} in {subj_name}.",
                        "source": "curated"
                    })
    return all_questions

if __name__ == "__main__":
    client = MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.environ.get("DB_NAME", "test_database")]
    col = db["Question"]

    questions = generate_questions()
    print(f"Generierte Fragen gesamt: {len(questions)}")

    inserted = 0
    for q in questions:
        exists = col.find_one({"profession": q["profession"], "subject": q["subject"], "question": q["question"]})
        if not exists:
            q_doc = {
                "created_by_id": "seed",
                "created_by": "seed",
                "created_date": "2026-01-01T00:00:00.000Z",
                **q
            }
            col.insert_one(q_doc)
            inserted += 1

    print(f"Erfolgreich {inserted} neue Fragen für alle Berufe in die Datenbank importiert!")
