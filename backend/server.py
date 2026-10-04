from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, re, json, uuid, hashlib, base64, logging, httpx
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

app = FastAPI()
api_router = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LICENSE_CODES = {c.strip().upper() for c in os.environ.get("LICENSE_CODES", "").split(",") if c.strip()}
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}
SALT = os.environ.get("SESSION_SECRET", "lapquiz")

# Entities scoped to the owner (personal data). Others are shared/global read.
SCOPED = {"UserQuestion", "StudySession", "CustomExam"}
ALLOWED = {"Question", "UserQuestion", "StudySession", "CustomExam", "Listing", "Message", "LiebeProfile"}


def coll(name): return db[f"e_{name}"]
def now_iso(): return datetime.now(timezone.utc).isoformat()
def clean(doc):
    if doc and "_id" in doc: doc.pop("_id", None)
    return doc
def hash_pw(pw): return hashlib.pbkdf2_hmac("sha256", pw.encode(), SALT.encode(), 100000).hex()


class QueryBody(BaseModel):
    filter: Optional[Dict[str, Any]] = None
    sort: Optional[str] = None
    limit: Optional[int] = None

class AIGenBody(BaseModel):
    subject_name: str
    topic: Optional[str] = None
    image_base64: Optional[str] = None
    pdf_base64: Optional[str] = None
    count: int = 5

class RegisterBody(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginBody(BaseModel):
    email: str
    password: str

class SessionBody(BaseModel):
    session_id: str

class RedeemBody(BaseModel):
    code: str


async def new_session(user_id):
    token = "st_" + uuid.uuid4().hex + uuid.uuid4().hex
    await db.user_sessions.insert_one({"user_id": user_id, "session_token": token,
                                       "expires_at": datetime.now(timezone.utc) + timedelta(days=7)})
    return token


async def current_user(request: Request):
    token = request.cookies.get("session_token")
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        return None
    s = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not s:
        return None
    exp = s["expires_at"]
    if isinstance(exp, str): exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None: exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        return None
    return await db.users.find_one({"user_id": s["user_id"]}, {"_id": 0, "password_hash": 0})


async def require_user(request: Request):
    u = await current_user(request)
    if not u:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return u


def set_cookie(resp, token):
    resp.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*3600)


def public_user(u):
    return {k: u.get(k) for k in ["user_id", "email", "name", "picture", "licensed", "role", "profession", "age", "canton", "ort", "profile_picture", "bio"]}


async def require_admin(request: Request):
    u = await require_user(request)
    if u.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return u


async def upsert_user(email, name, picture="", password=None):
    existing = await db.users.find_one({"email": email})
    if existing:
        return existing["user_id"]
    uid = f"user_{uuid.uuid4().hex[:12]}"
    # First user ever, or a configured admin email, becomes admin.
    is_admin = email.lower() in ADMIN_EMAILS or (await db.users.count_documents({"role": "admin"})) == 0
    doc = {"user_id": uid, "email": email, "name": name or email.split("@")[0], "picture": picture,
           "licensed": False, "role": "admin" if is_admin else "user",
           "profession": "kaufmann", "age": None, "canton": "", "ort": "",
           "profile_picture": picture or "", "bio": "", "created_at": now_iso()}
    if password is not None:
        doc["password_hash"] = hash_pw(password)
    await db.users.insert_one(doc)
    return uid


# ---------- Auth endpoints ----------
@api_router.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert")
    uid = await upsert_user(body.email, body.name, password=body.password)
    token = await new_session(uid)
    set_cookie(response, token)
    u = await db.users.find_one({"user_id": uid}, {"_id": 0})
    return {"user": public_user(u), "session_token": token}


@api_router.post("/auth/login")
async def login(body: LoginBody, response: Response):
    u = await db.users.find_one({"email": body.email})
    if not u or u.get("password_hash") != hash_pw(body.password):
        raise HTTPException(status_code=401, detail="E-Mail oder Passwort falsch")
    token = await new_session(u["user_id"])
    set_cookie(response, token)
    return {"user": public_user(u), "session_token": token}


@api_router.post("/auth/session")
async def auth_session(body: SessionBody, response: Response):
    async with httpx.AsyncClient() as c:
        r = await c.get("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                        headers={"X-Session-ID": body.session_id})
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Session ungültig")
        data = r.json()
    uid = await upsert_user(data["email"], data.get("name"), data.get("picture", ""))
    token = await new_session(uid)
    set_cookie(response, token)
    u = await db.users.find_one({"user_id": uid}, {"_id": 0})
    return {"user": public_user(u), "session_token": token}


@api_router.get("/auth/me")
async def auth_me(request: Request):
    u = await current_user(request)
    if not u:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return public_user(u)


@api_router.put("/auth/me")
async def auth_update(request: Request, patch: Dict[str, Any]):
    u = await require_user(request)
    for k in ["user_id", "email", "password_hash", "licensed"]:
        patch.pop(k, None)
    await db.users.update_one({"user_id": u["user_id"]}, {"$set": patch})
    nu = await db.users.find_one({"user_id": u["user_id"]}, {"_id": 0})
    return public_user(nu)


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token") or (request.headers.get("Authorization", "")[7:] or None)
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api_router.post("/auth/redeem")
async def redeem(request: Request, body: RedeemBody):
    u = await require_user(request)
    code = body.code.strip().upper()
    lic = await db.licenses.find_one({"code": code})
    if not lic:
        raise HTTPException(status_code=400, detail="Ungültiger Lizenzcode")
    if not lic.get("active", True):
        raise HTTPException(status_code=400, detail="Dieser Lizenzcode wurde gesperrt")
    used_by = lic.get("used_by", [])
    max_uses = lic.get("max_uses", 0) or 0
    if u["user_id"] not in used_by and max_uses and len(used_by) >= max_uses:
        raise HTTPException(status_code=400, detail="Lizenzcode-Limit erreicht")
    if u["user_id"] not in used_by:
        await db.licenses.update_one({"code": code}, {"$addToSet": {"used_by": u["user_id"]}, "$inc": {"uses": 1}})
    await db.users.update_one({"user_id": u["user_id"]}, {"$set": {"licensed": True}})
    nu = await db.users.find_one({"user_id": u["user_id"]}, {"_id": 0})
    return public_user(nu)


# ---------- Admin: license management ----------
class LicenseCreate(BaseModel):
    code: Optional[str] = None
    note: Optional[str] = None
    max_uses: int = 0


def gen_code():
    import random, string
    return "LAP-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


@api_router.get("/admin/licenses")
async def admin_list_licenses(request: Request):
    await require_admin(request)
    rows = await db.licenses.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return rows


@api_router.post("/admin/licenses")
async def admin_create_license(request: Request, body: LicenseCreate):
    admin = await require_admin(request)
    code = (body.code or gen_code()).strip().upper()
    if await db.licenses.find_one({"code": code}):
        raise HTTPException(status_code=400, detail="Code existiert bereits")
    lic = {"id": str(uuid.uuid4()), "code": code, "active": True, "note": body.note or "",
           "max_uses": max(0, int(body.max_uses or 0)), "uses": 0, "used_by": [],
           "created_at": now_iso(), "created_by": admin["email"]}
    await db.licenses.insert_one(dict(lic))
    lic.pop("_id", None)
    return lic


@api_router.patch("/admin/licenses/{lic_id}")
async def admin_toggle_license(request: Request, lic_id: str, data: Dict[str, Any]):
    await require_admin(request)
    patch = {}
    if "active" in data: patch["active"] = bool(data["active"])
    if "note" in data: patch["note"] = data["note"]
    if "max_uses" in data: patch["max_uses"] = max(0, int(data["max_uses"] or 0))
    await db.licenses.update_one({"id": lic_id}, {"$set": patch})
    r = await db.licenses.find_one({"id": lic_id}, {"_id": 0})
    return r


@api_router.delete("/admin/licenses/{lic_id}")
async def admin_delete_license(request: Request, lic_id: str):
    await require_admin(request)
    await db.licenses.delete_one({"id": lic_id})
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    total_users = await db.users.count_documents({})
    licensed_users = await db.users.count_documents({"licensed": True})
    total_codes = await db.licenses.count_documents({})
    active_codes = await db.licenses.count_documents({"active": True})
    return {"total_users": total_users, "licensed_users": licensed_users,
            "total_codes": total_codes, "active_codes": active_codes}


# ---------- Generic entity CRUD (per-user scoped) ----------
def check(name):
    if name not in ALLOWED:
        raise HTTPException(status_code=404, detail="Unknown entity")

async def do_query(name, flt, sort, limit):
    cursor = coll(name).find(flt or {})
    if sort:
        desc = sort.startswith("-"); key = sort[1:] if desc else sort
        cursor = cursor.sort(key, -1 if desc else 1)
    if limit: cursor = cursor.limit(int(limit))
    rows = await cursor.to_list(length=limit or 5000)
    return [clean(r) for r in rows]

@api_router.post("/entities/{name}/list")
async def entity_list(name: str, body: QueryBody, request: Request):
    check(name); u = await require_user(request)
    flt = dict(body.filter or {})
    if name in SCOPED:
        flt["created_by_id"] = u["user_id"]
    return await do_query(name, flt, body.sort, body.limit)

@api_router.get("/entities/{name}/{item_id}")
async def entity_get(name: str, item_id: str, request: Request):
    check(name); await require_user(request)
    r = await coll(name).find_one({"id": item_id})
    return clean(r) if r else None

@api_router.post("/entities/{name}")
async def entity_create(name: str, data: Dict[str, Any], request: Request):
    check(name); u = await require_user(request)
    rec = {"id": str(uuid.uuid4()), "created_by_id": u["user_id"], "created_by": u["email"], "created_date": now_iso(), **data}
    await coll(name).insert_one(dict(rec)); return clean(rec)

@api_router.post("/entities/{name}/bulk")
async def entity_bulk(name: str, items: List[Dict[str, Any]], request: Request):
    check(name); u = await require_user(request)
    created = [{"id": str(uuid.uuid4()), "created_by_id": u["user_id"], "created_by": u["email"], "created_date": now_iso(), **d} for d in items]
    if created: await coll(name).insert_many([dict(c) for c in created])
    return [clean(c) for c in created]

@api_router.put("/entities/{name}/{item_id}")
async def entity_update(name: str, item_id: str, data: Dict[str, Any], request: Request):
    check(name); await require_user(request); data.pop("id", None)
    await coll(name).update_one({"id": item_id}, {"$set": data})
    r = await coll(name).find_one({"id": item_id}); return clean(r)

@api_router.delete("/entities/{name}/{item_id}")
async def entity_delete(name: str, item_id: str, request: Request):
    check(name); await require_user(request)
    await coll(name).delete_one({"id": item_id}); return {"ok": True}

@api_router.post("/entities/{name}/delete-many")
async def entity_delete_many(name: str, body: QueryBody, request: Request):
    check(name); u = await require_user(request)
    flt = dict(body.filter or {})
    if name in SCOPED: flt["created_by_id"] = u["user_id"]
    await coll(name).delete_many(flt); return {"ok": True}


# ---------- AI ----------
QUESTION_RULES = """Regeln: Mische mc (4 Optionen), tf (options ["Wahr","Falsch"]) und gap (options []). Bei mc genau eine richtige Antwort. Bei tf correct_answer "Wahr"/"Falsch". Bei gap das fehlende Wort. Mehrere akzeptierte Antworten mit "|" trennen. Jede Frage mit knapper Erklärung (explanation). Fachlich korrekt, keine Duplikate."""

def extract_json(text):
    if not text: return None
    text = re.sub(r"^```(?:json)?", "", text.strip()).strip(); text = re.sub(r"```$", "", text).strip()
    try: return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try: return json.loads(m.group(0))
            except Exception: return None
    return None

def pdf_to_text(pdf_b64):
    try:
        from pypdf import PdfReader
        import io
        if "," in pdf_b64 and pdf_b64.strip().startswith("data:"):
            pdf_b64 = pdf_b64.split(",", 1)[1]
        raw = base64.b64decode(pdf_b64)
        reader = PdfReader(io.BytesIO(raw))
        txt = "\n".join((p.extract_text() or "") for p in reader.pages[:15])
        return txt[:12000]
    except Exception as e:
        logger.warning(f"pdf parse failed: {e}"); return ""

@api_router.post("/ai/generate-questions")
async def ai_generate(body: AIGenBody, request: Request):
    await require_user(request)
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key: raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY missing")
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
    n = max(1, min(10, body.count or 5))
    topic = body.topic or "allgemein, passend zum Fach"
    schema = '{"questions":[{"type":"mc|tf|gap","question":"...","options":["..."],"correct_answer":"...","explanation":"..."}]}'
    pdf_text = pdf_to_text(body.pdf_base64) if body.pdf_base64 else ""
    if body.image_base64:
        task = f'Analysiere das Foto von Lernunterlagen und erstelle {n} Prüfungsfragen zum Fach "{body.subject_name}".'
    elif pdf_text:
        task = f'Erstelle {n} Prüfungsfragen zum Fach "{body.subject_name}" basierend auf diesem Skript-Text:\n"""\n{pdf_text}\n"""'
    else:
        task = f'Erstelle {n} Prüfungsfragen für die Schweizer LAP im Fach "{body.subject_name}". Thema: {topic}.'
    prompt = f"{task}\n\n{QUESTION_RULES}\n\nAntworte NUR mit gültigem JSON in diesem Format:\n{schema}"
    try:
        chat = LlmChat(api_key=key, session_id=f"lapquiz-{uuid.uuid4()}",
                       system_message="Du bist Experte für Schweizer Berufsprüfungen. Antworte nur mit gültigem JSON.").with_model("openai", "gpt-4o")
        if body.image_base64:
            b = body.image_base64
            if "," in b and b.strip().startswith("data:"): b = b.split(",", 1)[1]
            msg = UserMessage(text=prompt, file_contents=[ImageContent(image_base64=b)])
        else:
            msg = UserMessage(text=prompt)
        resp = await chat.send_message(msg)
        data = extract_json(resp if isinstance(resp, str) else str(resp))
        if not data or "questions" not in data: raise ValueError("keine Fragen")
        out = []
        for q in data["questions"][:n]:
            t = q.get("type", "mc"); opts = q.get("options") or []
            if t == "tf": opts = ["Wahr", "Falsch"]
            elif t == "gap": opts = []
            out.append({"type": t, "question": q.get("question", ""), "options": opts,
                        "correct_answer": q.get("correct_answer", ""), "explanation": q.get("explanation", "")})
        return {"questions": out}
    except Exception as e:
        logger.exception("AI failed"); raise HTTPException(status_code=502, detail=f"KI fehlgeschlagen: {e}")


@api_router.get("/")
async def root(): return {"message": "LAP QUIZ API"}

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


async def seed():
    # Seed license codes from env into the DB (so admins can manage them).
    for code in LICENSE_CODES:
        if not await db.licenses.find_one({"code": code}):
            await db.licenses.insert_one({"id": str(uuid.uuid4()), "code": code, "active": True,
                                          "note": "Standard-Code", "max_uses": 0, "uses": 0, "used_by": [],
                                          "created_at": now_iso(), "created_by": "system"})
    # Curated questions & demo marketplace/profiles are shared (global read).
    if await coll("Question").count_documents({}) == 0:
        try:
            from seed_data import SEED_QUESTIONS, SEED_PROFILES, SEED_LISTINGS
        except Exception as e:
            logger.warning(f"No seed: {e}"); return
        def mk(arr, extra): return [{"id": str(uuid.uuid4()), "created_date": now_iso(), **extra, **d} for d in arr]
        sys = {"created_by_id": "system", "created_by": "system@lapquiz.ch"}
        if SEED_QUESTIONS: await coll("Question").insert_many(mk(SEED_QUESTIONS, sys))
        if SEED_LISTINGS: await coll("Listing").insert_many(mk(SEED_LISTINGS, sys))
        profiles = [{"id": str(uuid.uuid4()), "created_date": now_iso(), "created_by_id": f"peer-{i}", "created_by": f"peer{i}@lapquiz.ch", **d} for i, d in enumerate(SEED_PROFILES)]
        if profiles: await coll("LiebeProfile").insert_many(profiles)
        logger.info("Seed complete")

@app.on_event("startup")
async def startup():
    try: await seed()
    except Exception as e: logger.warning(f"seed failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client(): client.close()
