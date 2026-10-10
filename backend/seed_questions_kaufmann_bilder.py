# LAP QUIZ – Fragen für den Beruf "kaufmann" (Inklusive Grafik-/Bild-Fragen)
import random

PROFESSION = "kaufmann"

def _mc(subject, q, opts, expl):
    correct = opts[0]
    shuffled = opts[:]
    random.Random(q).shuffle(shuffled)
    return {"profession": PROFESSION, "subject": subject, "type": "mc", "question": q,
            "options": shuffled, "correct_answer": correct, "explanation": expl, "source": "curated"}

def _tf(subject, q, value, expl):
    return {"profession": PROFESSION, "subject": subject, "type": "tf", "question": q,
            "options": ["Wahr", "Falsch"], "correct_answer": "Wahr" if value else "Falsch",
            "explanation": expl, "source": "curated"}

def _gap(subject, q, answer, expl):
    return {"profession": PROFESSION, "subject": subject, "type": "gap", "question": q,
            "options": [], "correct_answer": answer, "explanation": expl, "source": "curated"}

RW = "rechnungswesen"
_RW = [
    ("m", 'Welche Kontenart zeigt folgendes T-Konto und wo steht der Anfangsbestand?<br><svg width="220" height="120" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><line x1="110" y1="10" x2="110" y2="110" stroke="#333" stroke-width="2"/><line x1="10" y1="40" x2="210" y2="40" stroke="#333" stroke-width="2"/><text x="55" y="30" font-size="14" font-weight="bold" text-anchor="middle">Soll</text><text x="165" y="30" font-size="14" font-weight="bold" text-anchor="middle">Haben</text><text x="55" y="65" font-size="13" fill="#0066cc" text-anchor="middle">AB</text></svg>', ["Aktivkonto (Anfangsbestand im Soll)", "Passivkonto (Anfangsbestand im Soll)", "Aktivkonto (Anfangsbestand im Haben)", "Aufwandskonto (Anfangsbestand im Haben)"], "Aktivkonten haben ihren Anfangsbestand (AB) auf der Soll-Seite."),
    ("m", 'Welche Grundregel der Bilanz veranschaulicht diese Darstellung?<br><svg width="300" height="80" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><rect x="10" y="10" width="135" height="60" fill="#e3f2fd" stroke="#1976d2"/><text x="77" y="35" font-size="13" font-weight="bold" text-anchor="middle">Aktiven</text><text x="77" y="55" font-size="11" text-anchor="middle">(Vermögen)</text><rect x="155" y="10" width="135" height="60" fill="#ffebee" stroke="#c62828"/><text x="222" y="35" font-size="13" font-weight="bold" text-anchor="middle">Passiven</text><text x="222" y="55" font-size="11" text-anchor="middle">(FK + EK)</text></svg>', ["Aktiven sind gleich gross wie Passiven (Bilanzsumme)", "Passiven sind immer doppelt so gross wie Aktiven", "Das Eigenkapital steht immer links", "Das Umlaufvermögen entspricht dem Fremdkapital"], "Die Bilanzsumme der Aktiven muss exakt der Bilanzsumme der Passiven entsprechen."),
    ("m", 'Wie lautet der korrekte Buchungssatz zu diesem Geschäftsfall?<br><svg width="320" height="70" style="background:#f9f9f9; border:1px dashed #666; margin:8px 0;"><text x="160" y="25" font-size="13" text-anchor="middle" font-weight="bold">Kauf von Büromaterial gegen Bar: 500 CHF</text><text x="160" y="50" font-size="12" fill="#444" text-anchor="middle">Büromaterial nimmt zu, Kasse nimmt ab.</text></svg>', ["Büromaterial an Kasse", "Kasse an Büromaterial", "Kreditoren an Kasse", "Kasse an Kreditoren"], "Das Aufwands-/Aktivkonto Büromaterial wird im Soll belastet, die Kasse im Haben entlastet."),
    ("m", 'Ein Anlagegut im Wert von 10000 CHF wird über 4 Jahre linear abgeschrieben. Wie hoch ist der Buchwert nach Jahr 2?<br><svg width="280" height="90" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><text x="140" y="25" font-size="12" text-anchor="middle">Anschaffung: 10000 CHF</text><text x="140" y="50" font-size="12" text-anchor="middle">Jährliche Abschreibung: 2500 CHF</text><text x="140" y="75" font-size="12" font-weight="bold" fill="#d32f2f" text-anchor="middle">Restwert nach 2 Jahren?</text></svg>', ["5000 CHF", "7500 CHF", "2500 CHF", "0 CHF"], "Nach 2 Jahren sind 2 x 2500 = 5000 CHF abgeschrieben."),
    ("m", 'Welches Schema zeigt den typischen Aufbau der Erfolgsrechnung?<br><svg width="300" height="70" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><rect x="10" y="10" width="135" height="50" fill="#e8f5e9" stroke="#388e3c"/><text x="77" y="40" font-size="13" font-weight="bold" text-anchor="middle">Aufwand</text><rect x="155" y="10" width="135" height="50" fill="#fffde7" stroke="#fbc02d"/><text x="222" y="40" font-size="13" font-weight="bold" text-anchor="middle">Ertrag</text></svg>', ["Linke Seite Aufwand, rechte Seite Ertrag", "Linke Seite Passiven, rechte Seite Aktiven", "Linke Seite Ertrag, rechte Seite Aufwand", "Nur Erträge werden verbucht"], "Aufwände im Soll, Erträge im Haben."),
    ("m", 'Wie viel beträgt der aktuelle Normalsatz der Schweizer Mehrwertsteuer (Stand seit 2024)?<br><svg width="220" height="50" style="background:#f5f5f5; border:1px solid #ddd; margin:8px 0;"><text x="110" y="30" font-size="14" font-weight="bold" text-anchor="middle" fill="#333">Eidgenössische MWST</text></svg>', ["8.1 %", "7.7 %", "2.5 %", "3.8 %"], "Normalsatz ist 8.1%."),
    ("m", 'Welche Transaktion führt zu dieser Bilanzveränderung?<br><svg width="300" height="60" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><text x="150" y="35" font-size="13" font-weight="bold" text-anchor="middle" fill="#1b5e20">Aktiven (+) und Passiven (+) steigen gleichmäßig</text></svg>', ["Kauf von Maschinen auf Rechnung (Kredit)", "Barbezug von der Bank in die Kasse", "Bezahlung einer offenen Rechnung per Bank", "Kauf von Handelswaren bar"], "Aktiven und Passiven erhöhen sich gleichzeitig."),
    ("m", 'Was ist ein wesentliches Merkmal der degressiven Abschreibung?<br><svg width="280" height="60" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><text x="140" y="35" font-size="12" text-anchor="middle">Abschreibungsbetrag sinkt über die Jahre</text></svg>', ["Die Abschreibung erfolgt vom jeweiligen Buchwert", "Die Abschreibung ist jedes Jahr exakt gleich hoch", "Der Abschreibungssatz wird vom Erlös berechnet", "Sie ist steuerlich in der Schweiz verboten"], "Degressiv = vom Buchwert."),
    ("t", 'Zeigt diese Mini-Grafik die korrekte Buchungsregel für ein Passivkonto?<br><svg width="240" height="50" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><text x="120" y="30" font-size="12" text-anchor="middle">Soll (-) | Haben (+)</text></svg>', True, "Passivkonten im Haben."),
    ("t", 'Ist diese Aussage zum Umlaufvermögen korrekt?<br><svg width="260" height="50" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><text x="130" y="30" font-size="12" text-anchor="middle">Kasse &amp; Debitoren = Umlaufvermögen</text></svg>', True, "Richtig."),
    ("g", 'Ergänzen Sie den Begriff für die linke Seite eines Kontos: <br><svg width="150" height="35" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><text x="75" y="23" font-size="14" font-weight="bold" text-anchor="middle">___</text></svg>', "Soll", "Soll."),
    ("g", 'Ergänzen Sie den Namen der Buchhaltungsmethode in der Schweiz: <br><svg width="180" height="35" style="background:#fff; border:1px solid #ccc; margin:8px 0;"><text x="90" y="23" font-size="14" font-weight="bold" text-anchor="middle">___ Buchhaltung</text></svg>', "Doppelte", "Doppelte.")
]

def _build_bild(subject, rows):
    out = []
    for r in rows:
        if r[0] == "m":
            out.append(_mc(subject, r[1], r[2], r[3]))
        elif r[0] == "t":
            out.append(_tf(subject, r[1], r[2], r[3]))
        else:
            out.append(_gap(subject, r[1], r[2], r[3]))
    return out

KAUFMANN_BILD_QUESTIONS = _build_bild(RW, _RW)
