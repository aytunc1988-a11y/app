# Seed data for LAP QUIZ backend (mirrors the original demo content).

def mc(subject, question, options, correct, explanation):
    return {"subject": subject, "type": "mc", "question": question, "options": options, "correct_answer": correct, "explanation": explanation, "source": "curated"}

def tf(subject, question, correct, explanation):
    return {"subject": subject, "type": "tf", "question": question, "options": ["Wahr", "Falsch"], "correct_answer": correct, "explanation": explanation, "source": "curated"}

def gap(subject, question, correct, explanation):
    return {"subject": subject, "type": "gap", "question": question, "options": [], "correct_answer": correct, "explanation": explanation, "source": "curated"}

SEED_QUESTIONS = [
    mc("rechnungswesen", "Zu welcher Seite der Bilanz gehört das Eigenkapital?", ["Aktiven", "Passiven", "Aufwand", "Ertrag"], "Passiven", "Eigenkapital ist eine Finanzierungsquelle und steht auf der Passivseite."),
    tf("rechnungswesen", "Das Eigenkapital gehört zu den Passiven.", "Wahr", "Passiven = Mittelherkunft, dazu zählt das Eigenkapital."),
    mc("rechnungswesen", "Was zeigt die Erfolgsrechnung?", ["Vermögen und Schulden", "Aufwand und Ertrag", "Nur Liquidität", "Nur Investitionen"], "Aufwand und Ertrag", "Die Erfolgsrechnung stellt Aufwand und Ertrag einer Periode gegenüber."),
    gap("rechnungswesen", "Aktiven = Passiven ist die Grundgleichung der ___.", "Bilanz", "Die Bilanzgleichung besagt: Aktiven = Passiven."),
    mc("rechnungswesen", "Ein Debitor ist ein…", ["Lieferant", "Kunde, der uns Geld schuldet", "Bankkredit", "Verlust"], "Kunde, der uns Geld schuldet", "Debitoren sind Forderungen gegenüber Kunden."),
    tf("rechnungswesen", "Abschreibungen sind ein Aufwand.", "Wahr", "Abschreibungen verteilen den Wertverlust als Aufwand über die Nutzungsdauer."),
    mc("rechnungswesen", "Wie nennt man Schulden gegenüber Lieferanten?", ["Debitoren", "Kreditoren", "Kasse", "Wertschriften"], "Kreditoren", "Kreditoren = Verbindlichkeiten aus Lieferungen und Leistungen."),
    mc("wg", "Was beschreibt die Inflation?", ["Sinkende Preise", "Anhaltender Anstieg des Preisniveaus", "Steigende Arbeitslosigkeit", "Mehr Export"], "Anhaltender Anstieg des Preisniveaus", "Inflation = allgemeiner, anhaltender Anstieg des Preisniveaus."),
    tf("wg", "Die Schweiz ist Mitglied der EU.", "Falsch", "Die Schweiz ist nicht EU-Mitglied, aber via bilaterale Verträge eng verbunden."),
    mc("wg", "Welche Behörde ist die Schweizer Regierung?", ["Nationalrat", "Ständerat", "Bundesrat", "Bundesgericht"], "Bundesrat", "Der Bundesrat ist die Exekutive (Regierung) der Schweiz."),
    gap("wg", "Der Preis entsteht am Markt durch Angebot und ___.", "Nachfrage", "Angebot und Nachfrage bestimmen den Marktpreis."),
    tf("wg", "Die AHV ist eine Sozialversicherung der 1. Säule.", "Wahr", "Die AHV gehört zur 1. Säule (staatliche Vorsorge)."),
    mc("wg", "Was bedeutet BIP?", ["Brutto-Inland-Preis", "Brutto-Inland-Produkt", "Basis-Investitions-Plan", "Bank-Index-Punkt"], "Brutto-Inland-Produkt", "BIP misst den Wert aller im Inland produzierten Waren und Dienstleistungen."),
    mc("ika", "Welche Tastenkombination kopiert markierten Text?", ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + Z"], "Ctrl + C", "Ctrl + C kopiert, Ctrl + V fügt ein."),
    tf("ika", "Eine CC-Empfängerin einer E-Mail ist für alle sichtbar.", "Wahr", "CC (Carbon Copy) ist für alle sichtbar, BCC dagegen nicht."),
    gap("ika", "In Excel beginnt jede Formel mit dem Zeichen ___.", "=", "Formeln in Excel starten immer mit dem Gleichheitszeichen."),
    mc("ika", "Welches Dateiformat eignet sich für unveränderbare Dokumente?", ["DOCX", "PDF", "TXT", "CSV"], "PDF", "PDF bewahrt Layout und ist plattformunabhängig."),
    mc("deutsch", "Welcher Satz ist korrekt?", ["Das Auto, welches rot ist, fährt schnell.", "Das Auto welches rot ist fährt schnell.", "Das Auto das rot ist fährt schnell.", "Das Auto, das rot ist fährt schnell"], "Das Auto, welches rot ist, fährt schnell.", "Relativsätze werden mit Kommas abgetrennt."),
    gap("deutsch", "Das Gegenteil von «billig» ist ___.", "teuer", "Antonym zu billig ist teuer."),
    tf("deutsch", "«Dass» mit Doppel-s leitet einen Nebensatz ein.", "Wahr", "Die Konjunktion «dass» schreibt man mit Doppel-s."),
    mc("englisch", "Choose the correct form: 'She ___ to work every day.'", ["go", "goes", "going", "gone"], "goes", "Third person singular adds -s: she goes."),
    gap("englisch", "The past tense of 'buy' is ___.", "bought", "'Buy' is irregular: buy – bought – bought."),
    tf("englisch", "'An invoice' is a bill for goods or services.", "Wahr", "An invoice is a document requesting payment."),
    mc("englisch", "Which is a formal email greeting?", ["Hey!", "Dear Sir or Madam,", "Yo,", "Hiya"], "Dear Sir or Madam,", "'Dear Sir or Madam' is a standard formal salutation."),
]

def _p(full_name, age, gender, canton, ort, distance_km, profession, online, bio):
    return {"full_name": full_name, "age": age, "gender": gender, "canton": canton, "ort": ort, "distance_km": distance_km, "profession": profession, "online": online, "bio": bio, "image_url": ""}

SEED_PROFILES = [
    _p("Lena Meier", 19, "weiblich", "Zürich", "Zürich", 3, "kaufmann", True, "Lerne für die KV-LAP, suche Lernpartner:innen für RW & W&G."),
    _p("Jonas Keller", 20, "männlich", "Bern", "Thun", 42, "informatik", False, "Angehender Informatiker EFZ. Netzwerke & Programmieren."),
    _p("Sara Huber", 18, "weiblich", "Aargau", "Aarau", 28, "gesundheit", True, "FaGe-Lernende im 2. Lehrjahr. Pflege ist meine Leidenschaft."),
    _p("Nico Brunner", 21, "männlich", "Luzern", "Luzern", 55, "elektro", False, "Elektroinstallateur in Ausbildung. NIN ist zach, aber machbar!"),
    _p("Mia Weber", 19, "weiblich", "St. Gallen", "St. Gallen", 80, "detailhandel", True, "Detailhandel EFZ. Freue mich auf Austausch über Warenwirtschaft."),
    _p("Luca Rossi", 20, "männlich", "Ticino", "Lugano", 210, "coiffeur", False, "Coiffeur-Lehrling, liebe Farben & Chemie."),
    _p("Elif Yilmaz", 18, "weiblich", "Basel-Stadt", "Basel", 70, "kaufmann", True, "KV im Büro. Suche Karteikarten-Tausch für Englisch."),
    _p("Tim Studer", 22, "männlich", "Thurgau", "Frauenfeld", 60, "logistik", False, "Logistiker EFZ. Lagerlogistik & Transport."),
    _p("Anna Schmid", 19, "weiblich", "Zürich", "Winterthur", 18, "kaufmann", True, "Lerngruppe für W&G gesucht – zusammen schafft man mehr."),
    _p("David Frei", 20, "männlich", "Zürich", "Uster", 12, "informatik", False, "Datenbanken & SQL sind mein Ding."),
    _p("Chiara Fontana", 18, "weiblich", "Vaud", "Lausanne", 180, "gesundheit", True, "FaGe, bilingue DE/FR."),
    _p("Marco Baumann", 21, "männlich", "Bern", "Bern", 40, "auto", False, "Büffle für die Autoprüfung Kat. B"),
]

SEED_LISTINGS = [
    {"title": "Lehrbuch-Set Rechnungswesen KV", "description": "Komplettes Set inkl. Lösungen, kaum Gebrauchsspuren. Ideal für die LAP-Vorbereitung.", "profession": "kaufmann", "canton": "Zürich", "ort": "Zürich", "price": 45, "image_url": "", "active": True},
    {"title": "TI-30 Taschenrechner", "description": "Für Prüfungen zugelassen, voll funktionsfähig.", "profession": "kaufmann", "canton": "Aargau", "ort": "Aarau", "price": 15, "image_url": "", "active": True},
    {"title": "Elektro-Formelsammlung + NIN", "description": "NIN-Ausgabe mit Notizen, dazu Formelsammlung Elektrotechnik.", "profession": "elektro", "canton": "Luzern", "ort": "Luzern", "price": 30, "image_url": "", "active": True},
    {"title": "Nachhilfe Englisch (online)", "description": "Gebe Nachhilfe für KV-Englisch, 25.-/Stunde via Video.", "profession": "kaufmann", "canton": "Bern", "ort": "Bern", "price": 25, "image_url": "", "active": True},
    {"title": "Pflege-Skripte FaGe gratis", "description": "Komplette Zusammenfassungen, gebe ich gratis ab. Abholung.", "profession": "gesundheit", "canton": "St. Gallen", "ort": "St. Gallen", "price": 0, "image_url": "", "active": True},
    {"title": "Coiffeur Farbkarten-Set", "description": "Professionelle Farbkarten, super zum Lernen von Farben & Chemie.", "profession": "coiffeur", "canton": "Ticino", "ort": "Lugano", "price": 20, "image_url": "", "active": True},
]

SEED_SESSIONS = [
    {"subject": "rechnungswesen", "question_count": 10, "correct_count": 8, "duration_seconds": 420},
    {"subject": "rechnungswesen", "question_count": 5, "correct_count": 5, "duration_seconds": 180},
    {"subject": "wg", "question_count": 10, "correct_count": 7, "duration_seconds": 390},
    {"subject": "ika", "question_count": 5, "correct_count": 3, "duration_seconds": 160},
    {"subject": "englisch", "question_count": 10, "correct_count": 9, "duration_seconds": 300},
]
