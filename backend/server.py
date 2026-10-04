from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import uuid
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEMO_USER = {
    "id": "demo-user",
    "email": "demo@lapquiz.ch",
    "full_name": "Demo Lernende",
    "role": "admin",
    "profession": "kaufmann",
    "age": 19,
    "canton": "Zürich",
    "ort": "Zürich",
    "profile_picture": "",
    "bio": "Ich bereite mich auf die KV-LAP vor und teste LAP QUIZ.",
}

ALLOWED = {"Question", "UserQuestion", "StudySession", "CustomExam", "Listing", "Message", "LiebeProfile"}


def coll(name: str):
    return db[f"e_{name}"]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def clean(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


class QueryBody(BaseModel):
    filter: Optional[Dict[str, Any]] = None
    sort: Optional[str] = None
    limit: Optional[int] = None


class AIGenBody(BaseModel):
    subject_name: str
    topic: Optional[str] = None
    image_base64: Optional[str] = None
    count: int = 5


@api_router.get("/me")
async def get_me():
    u = await db.app_user.find_one({"id": DEMO_USER["id"]})
    if not u:
        await db.app_user.insert_one({**DEMO_USER})
        u = {**DEMO_USER}
    return clean(u)


@api_router.put("/me")
async def update_me(patch: Dict[str, Any]):
    patch.pop("id", None)
    await db.app_user.update_one({"id": DEMO_USER["id"]}, {"$set": patch}, upsert=True)
    u = await db.app_user.find_one({"id": DEMO_USER["id"]})
    return clean(u)


def check(name):
    if name not in ALLOWED:
        raise HTTPException(status_code=404, detail="Unknown entity")


async def do_query(name, flt, sort, limit):
    q = flt or {}
    cursor = coll(name).find(q)
    if sort:
        desc = sort.startswith("-")
        key = sort[1:] if desc else sort
        cursor = cursor.sort(key, -1 if desc else 1)
    if limit:
        cursor = cursor.limit(int(limit))
    rows = await cursor.to_list(length=limit or 5000)
    return [clean(r) for r in rows]


@api_router.post("/entities/{name}/list")
async def entity_list(name: str, body: QueryBody):
    check(name)
    return await do_query(name, body.filter, body.sort, body.limit)


@api_router.get("/entities/{name}/{item_id}")
async def entity_get(name: str, item_id: str):
    check(name)
    r = await coll(name).find_one({"id": item_id})
    return clean(r) if r else None


@api_router.post("/entities/{name}")
async def entity_create(name: str, data: Dict[str, Any]):
    check(name)
    rec = {
        "id": str(uuid.uuid4()),
        "created_by_id": DEMO_USER["id"],
        "created_by": DEMO_USER["email"],
        "created_date": now_iso(),
        **data,
    }
    await coll(name).insert_one(dict(rec))
    return clean(rec)


@api_router.post("/entities/{name}/bulk")
async def entity_bulk(name: str, items: List[Dict[str, Any]]):
    check(name)
    created = []
    for data in items:
        rec = {
            "id": str(uuid.uuid4()),
            "created_by_id": DEMO_USER["id"],
            "created_by": DEMO_USER["email"],
            "created_date": now_iso(),
            **data,
        }
        created.append(rec)
    if created:
        await coll(name).insert_many([dict(c) for c in created])
    return [clean(c) for c in created]


@api_router.put("/entities/{name}/{item_id}")
async def entity_update(name: str, item_id: str, data: Dict[str, Any]):
    check(name)
    data.pop("id", None)
    await coll(name).update_one({"id": item_id}, {"$set": data})
    r = await coll(name).find_one({"id": item_id})
    return clean(r)


@api_router.delete("/entities/{name}/{item_id}")
async def entity_delete(name: str, item_id: str):
    check(name)
    await coll(name).delete_one({"id": item_id})
    return {"ok": True}


@api_router.post("/entities/{name}/delete-many")
async def entity_delete_many(name: str, body: QueryBody):
    check(name)
    await coll(name).delete_many(body.filter or {})
    return {"ok": True}


QUESTION_RULES = """Regeln für die Fragen:
- Mische die Typen mc (Multiple Choice mit genau 4 Optionen), tf (Wahr/Falsch, options ["Wahr","Falsch"]) und gap (Lückentext, options []).
- Bei mc: vier plausible Distraktoren, genau eine richtige Antwort in correct_answer.
- Bei tf: correct_answer ist "Wahr" oder "Falsch".
- Bei gap: correct_answer ist das fehlende Wort oder eine kurze Phrase.
- correct_answer darf mehrere akzeptierte Antworten enthalten, getrennt mit "|".
- Jede Frage bekommt eine knappe Erklärung (Feld explanation).
- Keine Duplikate, keine trivialen Fragen, fachlich korrekt."""


def extract_json(text: str):
    if not text:
        return None
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                return None
    return None


@api_router.post("/ai/generate-questions")
async def ai_generate(body: AIGenBody):
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Integration library missing: {e}")

    topic = body.topic or "allgemein, passend zum Fach"
    schema_hint = (
        '{"questions":[{"type":"mc|tf|gap","question":"...","options":["..."],'
        '"correct_answer":"...","explanation":"..."}]}'
    )

    if body.image_base64:
        task = (
            f"Du analysierst ein Foto von Lernunterlagen (Lehrbuch, Skript, Notizen) für die Schweizer "
            f"LAP-Vorbereitung. Erstelle daraus {body.count} passende Prüfungsfragen zum Fach "
            f'"{body.subject_name}".'
        )
    else:
        task = (
            f"Du erstellst Prüfungsfragen für Lernende in der Schweiz (LAP-Vorbereitung) im Fach "
            f'"{body.subject_name}". Thema: {topic}. Erstelle {body.count} neue, abwechslungsreiche '
            f"und fachlich korrekte Fragen."
        )

    prompt = (
        f"{task}\n\n{QUESTION_RULES}\n\n"
        f"Antworte AUSSCHLIESSLICH mit gültigem JSON (ohne Markdown, ohne Text davor/danach) "
        f"in genau diesem Format:\n{schema_hint}"
    )

    try:
        chat = LlmChat(
            api_key=key,
            session_id=f"lapquiz-{uuid.uuid4()}",
            system_message="Du bist ein Experte für Schweizer Berufs- und Theorieprüfungen und erstellst präzise Lernfragen. Antworte immer nur mit gültigem JSON.",
        ).with_model("openai", "gpt-4o")

        if body.image_base64:
            b64 = body.image_base64
            if "," in b64 and b64.strip().startswith("data:"):
                b64 = b64.split(",", 1)[1]
            msg = UserMessage(text=prompt, file_contents=[ImageContent(image_base64=b64)])
        else:
            msg = UserMessage(text=prompt)

        resp = await chat.send_message(msg)
        text = resp if isinstance(resp, str) else str(resp)
        data = extract_json(text)
        if not data or "questions" not in data:
            raise ValueError("Konnte keine Fragen aus der KI-Antwort lesen")
        questions = []
        for q in data.get("questions", []):
            qtype = q.get("type", "mc")
            opts = q.get("options") or []
            if qtype == "tf":
                opts = ["Wahr", "Falsch"]
            elif qtype == "gap":
                opts = []
            questions.append({
                "type": qtype,
                "question": q.get("question", ""),
                "options": opts,
                "correct_answer": q.get("correct_answer", ""),
                "explanation": q.get("explanation", ""),
            })
        return {"questions": questions}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("AI generation failed")
        raise HTTPException(status_code=502, detail=f"KI-Generierung fehlgeschlagen: {e}")


@api_router.get("/")
async def root():
    return {"message": "LAP QUIZ API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed():
    await get_me()
    if await coll("Question").count_documents({}) > 0:
        return
    try:
        from seed_data import SEED_QUESTIONS, SEED_PROFILES, SEED_LISTINGS, SEED_SESSIONS
    except Exception as e:
        logger.warning(f"No seed data: {e}")
        return
    owner = {"created_by_id": DEMO_USER["id"], "created_by": DEMO_USER["email"]}

    def mk(arr, extra):
        return [{"id": str(uuid.uuid4()), "created_date": now_iso(), **extra, **d} for d in arr]

    if SEED_QUESTIONS:
        await coll("Question").insert_many(mk(SEED_QUESTIONS, owner))
    if SEED_SESSIONS:
        await coll("StudySession").insert_many(mk(SEED_SESSIONS, owner))
    if SEED_LISTINGS:
        await coll("Listing").insert_many(mk(SEED_LISTINGS, owner))
    profiles = []
    for i, d in enumerate(SEED_PROFILES):
        profiles.append({"id": str(uuid.uuid4()), "created_date": now_iso(),
                         "created_by_id": f"peer-{i}", "created_by": f"peer{i}@lapquiz.ch", **d})
    if profiles:
        await coll("LiebeProfile").insert_many(profiles)
    logger.info("Seed complete")


@app.on_event("startup")
async def startup():
    try:
        await seed()
    except Exception as e:
        logger.warning(f"Seed failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
