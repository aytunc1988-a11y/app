# LAP QUIZ – Fragen für den Beruf "kaufmann" (Kaufmann/Kauffrau EFZ)
# 5 Fächer x 50 Fragen = 250 Fragen (je Fach: 25 mc, 13 tf, 12 gap).
# Bei mc steht die richtige Antwort zuerst; sie wird beim Aufbau deterministisch gemischt.

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


# ---------------------------------------------------------------- Rechnungswesen
RW = "rechnungswesen"
_RW = [
    ("m", "Welches Konto ist ein Aktivkonto?", ["Kasse", "Kreditoren", "Eigenkapital", "Darlehensschuld"], "Die Kasse ist ein Vermögenswert und steht auf der Aktivseite."),
    ("m", "Wo wird die Zunahme eines Aktivkontos gebucht?", ["Im Soll", "Im Haben", "Auf beiden Seiten", "Gar nicht"], "Aktivkonten nehmen im Soll zu und im Haben ab."),
    ("m", "Wo wird die Zunahme eines Passivkontos gebucht?", ["Im Haben", "Im Soll", "Auf beiden Seiten", "Gar nicht"], "Passivkonten nehmen im Haben zu und im Soll ab."),
    ("m", "Was ist ein Aktivtausch?", ["Ein Aktivkonto nimmt zu, ein anderes ab", "Ein Aktiv- und ein Passivkonto nehmen zu", "Ein Passivkonto nimmt zu, ein anderes ab", "Aktiv- und Passivkonto nehmen ab"], "Beim Aktivtausch bleibt die Bilanzsumme gleich, nur die Aktiven verschieben sich."),
    ("m", "Was ist eine Bilanzverlängerung?", ["Aktiven und Passiven nehmen gleichzeitig zu", "Aktiven und Passiven nehmen gleichzeitig ab", "Nur die Aktiven verändern sich", "Nur der Gewinn steigt"], "Bei der Bilanzverlängerung wächst die Bilanzsumme, z. B. Kauf von Mobiliar auf Rechnung."),
    ("m", "Was ist eine Bilanzverkürzung?", ["Aktiven und Passiven nehmen gleichzeitig ab", "Aktiven und Passiven nehmen gleichzeitig zu", "Ein Aktivtausch", "Ein Passivtausch"], "Z. B. Bezahlung einer Lieferantenrechnung per Bank: Kreditoren und Bank sinken."),
    ("m", "Wie lautet der Buchungssatz beim Kauf von Mobiliar auf Rechnung?", ["Mobiliar an Kreditoren", "Kreditoren an Mobiliar", "Mobiliar an Kasse", "Kasse an Mobiliar"], "Mobiliar nimmt zu (Soll), Kreditoren nehmen zu (Haben)."),
    ("m", "Wie lautet der Buchungssatz bei Barzahlung einer Kundenrechnung?", ["Kasse an Debitoren", "Debitoren an Kasse", "Kasse an Kreditoren", "Kreditoren an Kasse"], "Die Kasse nimmt zu, die Forderung (Debitoren) nimmt ab."),
    ("m", "Zu welcher Kontenklasse (Kontenrahmen KMU) gehören die Aktiven?", ["Klasse 1", "Klasse 2", "Klasse 3", "Klasse 4"], "Klasse 1 = Aktiven, Klasse 2 = Passiven."),
    ("m", "Zu welcher Kontenklasse (Kontenrahmen KMU) gehört der Personalaufwand?", ["Klasse 5", "Klasse 3", "Klasse 4", "Klasse 2"], "Klasse 5 = Personalaufwand."),
    ("m", "Wie berechnet man den Bruttogewinn?", ["Nettoerlös minus Warenaufwand", "Ertrag minus Personalaufwand", "Aktiven minus Passiven", "Warenaufwand minus Nettoerlös"], "Bruttogewinn = Nettoerlös aus Lieferungen und Leistungen – Warenaufwand."),
    ("m", "Wie berechnet man den Eigenfinanzierungsgrad?", ["Eigenkapital / Gesamtkapital x 100", "Fremdkapital / Eigenkapital x 100", "Umlaufvermögen / Anlagevermögen x 100", "Gewinn / Umsatz x 100"], "Er zeigt, wie viel Prozent des Gesamtkapitals Eigenkapital sind."),
    ("m", "Wie berechnet man den Liquiditätsgrad 2?", ["(Flüssige Mittel + Forderungen) / kurzfr. Fremdkapital x 100", "Flüssige Mittel / Eigenkapital x 100", "Umlaufvermögen / Gesamtkapital x 100", "Gewinn / Eigenkapital x 100"], "Der Liquiditätsgrad 2 misst die kurzfristige Zahlungsfähigkeit."),
    ("m", "Anschaffung 10'000 CHF, Nutzungsdauer 5 Jahre, linear: Wie hoch ist die jährliche Abschreibung?", ["2'000 CHF", "1'000 CHF", "5'000 CHF", "500 CHF"], "10'000 / 5 = 2'000 CHF pro Jahr."),
    ("m", "Wovon wird bei der degressiven Abschreibung der Prozentsatz berechnet?", ["Vom jeweiligen Buchwert", "Vom Anschaffungswert", "Vom Verkaufspreis", "Vom Gewinn"], "Degressiv = vom Buchwert; der Abschreibungsbetrag sinkt jedes Jahr."),
    ("m", "Der Normalsatz der Schweizer Mehrwertsteuer beträgt seit 2024…", ["8.1 %", "7.7 %", "2.6 %", "3.8 %"], "Normalsatz 8.1 %, reduzierter Satz 2.6 %, Sondersatz Beherbergung 3.8 %."),
    ("m", "Miete für Januar wird bereits im Dezember bezahlt. Was entsteht am 31.12.?", ["Transitorische Aktiven", "Transitorische Passiven", "Rückstellung", "Delkredere"], "Vorauszahlung für Aufwand des neuen Jahres = transitorische Aktiven."),
    ("m", "Die Stromrechnung für das alte Jahr trifft erst im Januar ein. Was entsteht am 31.12.?", ["Transitorische Passiven", "Transitorische Aktiven", "Delkredere", "Abschreibung"], "Aufwand des alten Jahres, noch nicht bezahlt = transitorische Passiven."),
    ("m", "Was ist eine Rückstellung?", ["Eine Verpflichtung, deren Höhe oder Fälligkeit noch ungewiss ist", "Eine bezahlte Rechnung", "Ein Bankguthaben", "Ein Kundenrabatt"], "Rückstellungen decken ungewisse, aber wahrscheinliche Verpflichtungen."),
    ("m", "Was ist das Delkredere?", ["Wertberichtigung auf Forderungen", "Rabatt an Kunden", "Eine Abschreibung auf Mobiliar", "Ein Lieferantenkredit"], "Das Delkredere berücksichtigt das Risiko, dass Kunden nicht bezahlen."),
    ("m", "Was ist Skonto?", ["Abzug bei Zahlung innert einer Frist", "Mengenrabatt", "Verzugszins", "Mehrwertsteuer"], "Skonto ist ein Preisnachlass für schnelle Zahlung."),
    ("m", "Wie lange müssen Geschäftsbücher in der Schweiz aufbewahrt werden?", ["10 Jahre", "5 Jahre", "2 Jahre", "20 Jahre"], "Gemäss Obligationenrecht beträgt die Aufbewahrungsfrist 10 Jahre."),
    ("m", "Was bewirkt ein Jahresgewinn beim Eigenkapital?", ["Es erhöht sich", "Es sinkt", "Es bleibt gleich", "Es wird zu Fremdkapital"], "Gewinne werden dem Eigenkapital zugeschlagen."),
    ("m", "Was bewirkt ein Privatbezug in der Einzelunternehmung?", ["Das Eigenkapital nimmt ab", "Das Eigenkapital nimmt zu", "Das Fremdkapital nimmt zu", "Der Gewinn steigt"], "Privatbezüge entnehmen Mittel aus dem Unternehmen."),
    ("m", "Was gehört zum Anlagevermögen?", ["Fahrzeuge", "Kasse", "Debitoren", "Warenlager"], "Anlagevermögen dient dem Betrieb langfristig, z. B. Fahrzeuge, Maschinen, Mobiliar."),
    ("t", "Kreditoren gehören zum Fremdkapital.", True, "Kreditoren sind Schulden gegenüber Lieferanten."),
    ("t", "Aufwand erhöht das Eigenkapital.", False, "Aufwand vermindert das Eigenkapital, Ertrag erhöht es."),
    ("t", "Übersteigt der Ertrag den Aufwand, liegt ein Gewinn vor.", True, "Gewinn = Ertrag – Aufwand."),
    ("t", "Bei Passivkonten steht die Zunahme im Soll.", False, "Bei Passivkonten steht die Zunahme im Haben."),
    ("t", "Debitoren sind Forderungen gegenüber Kunden.", True, "Debitoren = Kunden, die uns Geld schulden."),
    ("t", "Die Kasse ist ein Passivkonto.", False, "Die Kasse ist ein Aktivkonto."),
    ("t", "Abschreibungen verringern den Buchwert eines Gegenstands.", True, "Buchwert = Anschaffungswert – bisherige Abschreibungen."),
    ("t", "Die Vorsteuer ist die Mehrwertsteuer auf Einkäufen und kann abgezogen werden.", True, "Vorsteuer wird von der geschuldeten Umsatzsteuer abgezogen."),
    ("t", "Die Bilanz zeigt Aufwand und Ertrag einer Periode.", False, "Das zeigt die Erfolgsrechnung; die Bilanz ist eine Stichtagsbetrachtung."),
    ("t", "Eigenkapital = Aktiven minus Fremdkapital.", True, "Umgestellte Bilanzgleichung."),
    ("t", "Jeder Buchung muss ein Beleg zugrunde liegen.", True, "Ohne Beleg keine Buchung (Belegprinzip)."),
    ("t", "Mobiliar gehört zum Umlaufvermögen.", False, "Mobiliar ist Anlagevermögen."),
    ("t", "Ein Darlehen mit 5 Jahren Laufzeit zählt zum langfristigen Fremdkapital.", True, "Langfristig = Fälligkeit über 12 Monate."),
    ("g", "Die linke Seite eines Kontos heisst ___.", "Soll", "Links = Soll, rechts = Haben."),
    ("g", "Die rechte Seite eines Kontos heisst ___.", "Haben", "Links = Soll, rechts = Haben."),
    ("g", "Vermögen = Fremdkapital + ___.", "Eigenkapital", "Das ist die Bilanzgleichung."),
    ("g", "Nettoerlös minus Warenaufwand ergibt den ___gewinn.", "Brutto", "Bruttogewinn = Nettoerlös – Warenaufwand."),
    ("g", "Forderungen gegenüber Kunden nennt man ___.", "Debitoren", "Debitoren = Forderungen aus Lieferungen und Leistungen."),
    ("g", "Die Mehrwertsteuer auf Verkäufen heisst ___steuer.", "Umsatz", "Umsatzsteuer = geschuldete MWST."),
    ("g", "Die Mehrwertsteuer auf Einkäufen heisst ___steuer.", "Vor", "Vorsteuer wird zurückgefordert."),
    ("g", "Eine Liste aller Konten eines Unternehmens heisst ___plan.", "Konten", "Kontenplan = individuelle Kontenliste."),
    ("g", "Anschaffungswert minus Abschreibungen ergibt den ___wert.", "Buch", "Buchwert = Restwert in der Buchhaltung."),
    ("g", "Die Schlussbilanz des alten Jahres ist die ___bilanz des neuen Jahres.", "Eröffnungs", "Schlussbilanz = Eröffnungsbilanz der Folgeperiode."),
    ("g", "Die Summe der Soll-Buchungen muss immer gleich der Summe der ___-Buchungen sein.", "Haben", "Doppelte Buchhaltung: Soll = Haben."),
    ("g", "Bilanz und ___rechnung bilden zusammen die Jahresrechnung.", "Erfolgs", "Dazu kommt der Anhang."),
]

# ---------------------------------------------------------------- Wirtschaft & Gesellschaft
WG = "wg"
_WG = [
    ("m", "Wie viele Kantone hat die Schweiz?", ["26", "20", "23", "30"], "Die Schweiz besteht aus 26 Kantonen (20 Voll- und 6 Halbkantone)."),
    ("m", "Wer wählt den Bundesrat?", ["Die Vereinigte Bundesversammlung", "Das Volk", "Das Bundesgericht", "Der Ständerat allein"], "Nationalrat und Ständerat wählen gemeinsam die Bundesräte."),
    ("m", "Wie viele Mitglieder hat der Bundesrat?", ["7", "5", "9", "12"], "Der Bundesrat besteht aus sieben gleichberechtigten Mitgliedern."),
    ("m", "Wie viele Sitze hat der Nationalrat?", ["200", "46", "100", "246"], "Nationalrat: 200 Sitze, Ständerat: 46 Sitze."),
    ("m", "Wie viele Sitze hat der Ständerat?", ["46", "200", "26", "50"], "Jeder Kanton 2 Sitze, Halbkantone 1 Sitz: total 46."),
    ("m", "Wie viele Unterschriften braucht eine Volksinitiative?", ["100'000 in 18 Monaten", "50'000 in 100 Tagen", "10'000 in 6 Monaten", "200'000 in 2 Jahren"], "Für eine Volksinitiative braucht es 100'000 Unterschriften innert 18 Monaten."),
    ("m", "Wie viele Unterschriften braucht ein fakultatives Referendum?", ["50'000 in 100 Tagen", "100'000 in 18 Monaten", "30'000 in 30 Tagen", "10'000 in 100 Tagen"], "50'000 Unterschriften innert 100 Tagen nach Veröffentlichung des Gesetzes."),
    ("m", "Wann ist ein Referendum obligatorisch?", ["Bei Verfassungsänderungen", "Bei jedem Gesetz", "Bei Budgetfragen", "Bei Gerichtsurteilen"], "Verfassungsänderungen müssen immer vors Volk und die Stände."),
    ("m", "Was ist die 2. Säule der Altersvorsorge?", ["Berufliche Vorsorge (BVG)", "AHV/IV", "Private Vorsorge", "Arbeitslosenversicherung"], "1. Säule AHV/IV, 2. Säule Pensionskasse, 3. Säule private Vorsorge."),
    ("m", "Welche Säule ist die private Vorsorge?", ["3. Säule", "1. Säule", "2. Säule", "4. Säule"], "Die 3. Säule umfasst die freiwillige, private Vorsorge."),
    ("m", "Was ist die Hauptpflicht des Verkäufers beim Kaufvertrag?", ["Ware übergeben und Eigentum verschaffen", "Rechnung stellen", "Ware versichern", "Verpackung bezahlen"], "Verkäufer: Ware liefern. Käufer: Preis zahlen und Ware annehmen."),
    ("m", "Wann müssen offene Mängel gerügt werden?", ["Sofort nach Erhalt", "Innert 1 Jahr", "Innert 5 Jahren", "Gar nicht"], "Offene Mängel sind unverzüglich zu rügen."),
    ("m", "Wie lange beträgt die Probezeit gemäss OR, wenn nichts anderes vereinbart wurde?", ["1 Monat", "3 Monate", "6 Monate", "2 Wochen"], "Die gesetzliche Probezeit beträgt 1 Monat (max. 3 Monate vereinbar)."),
    ("m", "Wie lang ist die Kündigungsfrist im ersten Dienstjahr (nach der Probezeit)?", ["1 Monat", "2 Monate", "3 Monate", "6 Monate"], "1. Dienstjahr: 1 Monat, 2.–9. Dienstjahr: 2 Monate, ab 10. Jahr: 3 Monate."),
    ("m", "Welche Rechtsform haftet mit dem gesamten Privatvermögen?", ["Einzelunternehmen", "AG", "GmbH", "Genossenschaft mit beschränkter Haftung"], "Beim Einzelunternehmen haftet der Inhaber unbeschränkt."),
    ("m", "Wie hoch ist das minimale Aktienkapital einer AG?", ["100'000 CHF", "20'000 CHF", "50'000 CHF", "1 Mio. CHF"], "AG: mindestens 100'000 CHF; GmbH: mindestens 20'000 CHF."),
    ("m", "Wie hoch ist das minimale Stammkapital einer GmbH?", ["20'000 CHF", "100'000 CHF", "50'000 CHF", "10'000 CHF"], "Das Mindeststammkapital der GmbH beträgt 20'000 CHF."),
    ("m", "Was passiert bei einem Angebotsüberschuss?", ["Der Preis sinkt", "Der Preis steigt", "Der Preis bleibt gleich", "Die Nachfrage sinkt zwingend auf null"], "Ist das Angebot grösser als die Nachfrage, sinkt der Preis."),
    ("m", "Welche Phase folgt auf die Hochkonjunktur (Boom)?", ["Abschwung", "Aufschwung", "Tiefstand", "Stagnation ist unmöglich"], "Konjunkturzyklus: Aufschwung, Boom, Abschwung, Rezession/Depression."),
    ("m", "Was ist die Hauptaufgabe der Schweizerischen Nationalbank?", ["Preisstabilität gewährleisten", "Steuern erheben", "Gesetze erlassen", "Löhne festlegen"], "Die SNB sorgt für Preisstabilität und eine angemessene Geldversorgung."),
    ("m", "Ab welchem Alter ist man in der Schweiz mündig?", ["18 Jahre", "16 Jahre", "20 Jahre", "21 Jahre"], "Mit 18 Jahren ist man volljährig und voll handlungsfähig."),
    ("m", "Welche ist eine juristische Person?", ["Aktiengesellschaft", "Einzelunternehmer", "Lernender", "Kunde"], "AG, GmbH, Verein usw. sind juristische Personen."),
    ("m", "Zu welchem Wirtschaftssektor gehört die Landwirtschaft?", ["Primärer Sektor", "Sekundärer Sektor", "Tertiärer Sektor", "Quartärer Sektor"], "Primär = Rohstoffgewinnung, sekundär = Industrie, tertiär = Dienstleistungen."),
    ("m", "Zu welchem Wirtschaftssektor gehören Banken?", ["Tertiärer Sektor", "Primärer Sektor", "Sekundärer Sektor", "Keinem"], "Banken sind Dienstleister."),
    ("m", "Welches Ziel gehört NICHT zum magischen Viereck der Wirtschaftspolitik?", ["Hohe Gewinne für alle Firmen", "Preisstabilität", "Hohe Beschäftigung", "Aussenwirtschaftliches Gleichgewicht"], "Magisches Viereck: Wachstum, Preisstabilität, Vollbeschäftigung, aussenwirtschaftl. Gleichgewicht."),
    ("t", "Das Stimmrecht beginnt in der Schweiz mit 18 Jahren.", True, "Stimm- und Wahlrecht ab 18 Jahren."),
    ("t", "Das Frauenstimmrecht wurde auf Bundesebene 1971 eingeführt.", True, "Auf Bundesebene seit 1971, in Appenzell Innerrhoden kantonal erst 1990."),
    ("t", "Der Bundesrat gehört zur Legislative.", False, "Der Bundesrat ist die Exekutive."),
    ("t", "Das Bundesgericht gehört zur Judikative.", True, "Judikative = Rechtsprechung."),
    ("t", "Der Lehrvertrag muss schriftlich abgeschlossen werden.", True, "Der Lehrvertrag braucht die Schriftform."),
    ("t", "Bei einem Monopol gibt es nur einen Anbieter.", True, "Monopol = ein Anbieter, viele Nachfrager."),
    ("t", "Die AHV wird im Umlageverfahren finanziert.", True, "Die heutigen Beiträge finanzieren die heutigen Renten."),
    ("t", "Die Arbeitslosenversicherung ist für Angestellte obligatorisch.", True, "ALV-Beiträge werden vom Lohn abgezogen."),
    ("t", "Inflation erhöht die Kaufkraft des Geldes.", False, "Inflation senkt die Kaufkraft."),
    ("t", "In der Schweiz gilt der Euro als offizielle Währung.", False, "Die Schweiz hat den Franken."),
    ("t", "Die Schweiz ist Mitglied der EU.", False, "Die Schweiz ist nicht Mitglied, hat aber bilaterale Verträge."),
    ("t", "Bedürfnisse sind unbegrenzt, die Mittel zur Befriedigung sind knapp.", True, "Das ist das Grundproblem der Wirtschaft."),
    ("t", "Die Bundesversammlung besteht aus Nationalrat und Ständerat.", True, "Sie ist das Parlament der Schweiz."),
    ("g", "Die drei Staatsgewalten sind Legislative, Exekutive und ___.", "Judikative", "Gewaltenteilung."),
    ("g", "Die Schweizer Währung heisst ___.", "Franken", "Der Schweizer Franken (CHF)."),
    ("g", "Die zwei Volksrechte auf Gesetzesebene sind Initiative und ___.", "Referendum", "Initiative = Vorschlag, Referendum = Veto."),
    ("g", "National- und Ständerat zusammen bilden die ___.", "Bundesversammlung", "Das Parlament der Schweiz."),
    ("g", "Ein allgemeiner, anhaltender Preisanstieg heisst ___.", "Inflation", "Das Gegenteil ist die Deflation."),
    ("g", "Sinkende Preise über längere Zeit nennt man ___.", "Deflation", "Das Gegenteil ist die Inflation."),
    ("g", "Der Gewinnanteil eines Aktionärs heisst ___.", "Dividende", "Dividende = Gewinnausschüttung."),
    ("g", "Der Staat finanziert sich hauptsächlich durch ___.", "Steuern", "Steuern und Abgaben."),
    ("g", "Der Vertrag zwischen Arbeitgeber und Arbeitnehmer heisst ___vertrag.", "Arbeits", "Einzelarbeitsvertrag nach OR."),
    ("g", "Die Schweizerische ___bank ist die Zentralbank der Schweiz.", "National", "SNB."),
    ("g", "Der Preis bildet sich am Markt aus Angebot und ___.", "Nachfrage", "Marktpreis."),
    ("g", "Die Dienstleistungsbranche gehört zum ___ Sektor (Zahlwort).", "dritten", "Der tertiäre (dritte) Sektor."),
]

# ---------------------------------------------------------------- IKA
IKA = "ika"
_IKA = [
    ("m", "Welche Excel-Formel addiert die Zellen A1 bis A10?", ["=SUMME(A1:A10)", "=A1+A10", "=ADD(A1;A10)", "=SUM A1-A10"], "Bereiche werden mit Doppelpunkt angegeben."),
    ("m", "Wie schreibt man einen absoluten Zellbezug auf A1?", ["$A$1", "A1$", "#A1", "&A&1"], "Das Dollarzeichen fixiert Spalte und Zeile."),
    ("m", "Welche Funktion prüft eine Bedingung und gibt je nach Ergebnis einen Wert zurück?", ["WENN", "SUMME", "RUNDEN", "ANZAHL"], "WENN(Bedingung; Dann; Sonst)."),
    ("m", "Welche Funktion berechnet den Durchschnitt?", ["MITTELWERT", "MEDIAN", "MAX", "SUMME"], "MITTELWERT bildet den arithmetischen Durchschnitt."),
    ("m", "Wofür verwendet man eine Pivot-Tabelle?", ["Daten zusammenfassen und auswerten", "Text formatieren", "E-Mails sortieren", "Bilder bearbeiten"], "Pivot-Tabellen fassen grosse Datenmengen flexibel zusammen."),
    ("m", "Welche Dateiendung hat eine moderne Excel-Datei?", [".xlsx", ".docx", ".pptx", ".pdf"], "Excel: .xlsx, Word: .docx, PowerPoint: .pptx."),
    ("m", "Welche Tastenkombination speichert ein Dokument?", ["Ctrl + S", "Ctrl + P", "Ctrl + N", "Ctrl + K"], "S wie «Save»."),
    ("m", "Welche Tastenkombination macht den letzten Schritt rückgängig?", ["Ctrl + Z", "Ctrl + Y", "Ctrl + X", "Ctrl + A"], "Ctrl + Z = Rückgängig."),
    ("m", "Welche Tastenkombination markiert alles?", ["Ctrl + A", "Ctrl + M", "Ctrl + E", "Ctrl + L"], "A wie «All»."),
    ("m", "Welche Word-Funktion erstellt personalisierte Briefe an viele Empfänger?", ["Serienbrief (Seriendruck)", "Inhaltsverzeichnis", "Fussnote", "Kopfzeile"], "Beim Serienbrief werden Felder aus einer Datenquelle eingefügt."),
    ("m", "Was bedeutet BCC in einer E-Mail?", ["Verdeckte Kopie", "Sichtbare Kopie", "Wichtige Mail", "Antwort an alle"], "BCC-Empfänger sind für andere nicht sichtbar."),
    ("m", "Wann verwendet man «Allen antworten»?", ["Wenn die Antwort für alle Empfänger relevant ist", "Immer", "Nie", "Nur bei Spam"], "Nur wenn alle die Antwort wirklich brauchen."),
    ("m", "Was ist Phishing?", ["Versuch, Zugangsdaten per gefälschter Nachricht zu stehlen", "Ein Virenschutz", "Eine Backup-Methode", "Ein Dateiformat"], "Phishing täuscht Vertrauenswürdigkeit vor."),
    ("m", "Welches Passwort ist am sichersten?", ["T7!kqP#92xLm", "123456", "passwort", "Hans1985"], "Lang, zufällig, mit Gross-/Kleinbuchstaben, Zahlen und Sonderzeichen."),
    ("m", "Was ist eine Zwei-Faktor-Authentifizierung (2FA)?", ["Anmeldung mit Passwort plus zweitem Nachweis", "Zwei Passwörter hintereinander", "Doppelte Datensicherung", "Zwei Benutzerkonten"], "Z. B. Passwort + Code per App oder SMS."),
    ("m", "Was bezeichnet man als Backup?", ["Datensicherung", "Virenscanner", "Netzwerkkabel", "Bildschirmschoner"], "Backup = Kopie der Daten für den Notfall."),
    ("m", "Seit wann gilt das revidierte Schweizer Datenschutzgesetz (revDSG)?", ["1. September 2023", "1. Januar 2018", "1. Mai 2020", "1. Januar 2025"], "Das revDSG trat am 1. September 2023 in Kraft."),
    ("m", "Was ist Cloud-Speicher?", ["Speicher auf Servern im Internet", "Ein USB-Stick", "Ein Arbeitsspeicher im PC", "Ein Drucker"], "Daten liegen bei einem Anbieter und sind überall abrufbar."),
    ("m", "Wie sollte eine E-Mail-Betreffzeile sein?", ["Kurz und aussagekräftig", "Leer", "Sehr lang", "Nur in Grossbuchstaben"], "Der Betreff soll den Inhalt auf einen Blick zeigen."),
    ("m", "Rechnungen werden nach Datum abgelegt. Welches Ordnungssystem ist das?", ["Chronologisch", "Alphabetisch", "Numerisch", "Geografisch"], "Chronologisch = nach Zeit."),
    ("m", "Wofür dient ein Wiedervorlagesystem?", ["Fristen und Termine nicht vergessen", "Dateien verschlüsseln", "Mails löschen", "Briefe frankieren"], "Dokumente erscheinen zum gewünschten Zeitpunkt wieder."),
    ("m", "Wie sollte der Bildschirm ergonomisch eingestellt sein?", ["Oberkante auf Augenhöhe oder leicht darunter", "Weit über Kopfhöhe", "Direkt am Fenster mit Gegenlicht", "Möglichst nah an den Augen"], "Das schont Nacken und Augen."),
    ("m", "Welche Funktion gibt in Excel die grösste Zahl eines Bereichs aus?", ["MAX", "MIN", "SUMME", "RUNDEN"], "MAX liefert den Höchstwert."),
    ("m", "Wofür steht die Abkürzung PDF?", ["Portable Document Format", "Personal Data File", "Print Document Fast", "Public Data Form"], "PDF bewahrt das Layout auf allen Geräten."),
    ("m", "Was macht SVERWEIS?", ["Sucht einen Wert in der ersten Spalte und gibt einen Wert aus derselben Zeile zurück", "Summiert Werte", "Sortiert Spalten", "Löscht doppelte Zeilen"], "Senkrechter Verweis in einer Matrix."),
    ("t", "Jede Excel-Formel beginnt mit einem Gleichheitszeichen.", True, "Ohne = wird der Inhalt als Text interpretiert."),
    ("t", "CC-Empfänger sind für alle anderen Empfänger sichtbar.", True, "BCC dagegen nicht."),
    ("t", "Ein PDF ist ideal für Dokumente, die nicht mehr verändert werden sollen.", True, "PDF ist plattformunabhängig und schwer änderbar."),
    ("t", "Man sollte dasselbe Passwort für alle Konten verwenden.", False, "Jedes Konto braucht ein eigenes Passwort."),
    ("t", "Ein Backup sollte an einem anderen Ort als das Original gespeichert werden.", True, "Schutz vor Feuer, Diebstahl und Defekt."),
    ("t", "Phishing-Mails erkennt man oft an Rechtschreibfehlern und Zeitdruck.", True, "Weitere Hinweise: unbekannte Absender und verdächtige Links."),
    ("t", "Ctrl + C fügt einen kopierten Text ein.", False, "Ctrl + C kopiert, Ctrl + V fügt ein."),
    ("t", "Schriftliche Geschäftsbriefe enthalten in der Regel eine Betreffzeile.", True, "Sie fasst den Inhalt in einem Satz zusammen."),
    ("t", "Mit einer Kopfzeile in Word kann man auf jeder Seite denselben Text anzeigen.", True, "Kopf- und Fusszeilen wiederholen sich seitenübergreifend."),
    ("t", "Das Datenschutzgesetz schützt Personendaten.", True, "Persönliche Daten dürfen nur rechtmässig bearbeitet werden."),
    ("t", "Eine Tabellenkalkulation eignet sich nicht zum Rechnen.", False, "Genau dafür ist sie gedacht."),
    ("t", "Unbekannte Anhänge sollte man ohne Prüfung öffnen.", False, "Anhänge können Schadsoftware enthalten."),
    ("t", "Mit Ctrl + P öffnet man in Office den Druckdialog.", True, "P wie «Print»."),
    ("g", "Die Tastenkombination zum Einfügen ist Ctrl + ___.", "V", "Ctrl + V = Einfügen."),
    ("g", "Die Tastenkombination zum Kopieren ist Ctrl + ___.", "C", "Ctrl + C = Kopieren."),
    ("g", "Die Tastenkombination zum Ausschneiden ist Ctrl + ___.", "X", "Ctrl + X = Ausschneiden."),
    ("g", "Eine Excel-Datei heisst Arbeitsmappe und enthält mehrere Arbeits___.", "blätter", "Eine Arbeitsmappe enthält mehrere Arbeitsblätter."),
    ("g", "Eine unerwünschte Massen-E-Mail nennt man ___.", "Spam", "Spam-Filter sortieren sie aus."),
    ("g", "Schadsoftware, die Dateien verschlüsselt und Lösegeld verlangt, heisst ___.", "Ransomware", "Ransom = Lösegeld."),
    ("g", "Die Funktion zum Zählen von Zahlenwerten in Excel heisst ___.", "ANZAHL", "ANZAHL zählt Zellen mit Zahlen."),
    ("g", "Zum Suchen in einem Dokument nutzt man Ctrl + ___.", "F", "F wie «Find»."),
    ("g", "Das Gegenstück zu Hardware ist die ___.", "Software", "Hardware = Geräte, Software = Programme."),
    ("g", "Das Zeichen für einen absoluten Bezug in Excel ist das ___zeichen.", "Dollar", "$A$1."),
    ("g", "Ein Programm zum Erstellen von Präsentationen heisst PowerPoint; für Texte verwendet man ___.", "Word", "Word = Textverarbeitung."),
    ("g", "Das Programm, mit dem man Webseiten anzeigt, heisst ___.", "Browser", "Z. B. Chrome, Firefox, Safari."),
]

# ---------------------------------------------------------------- Deutsch
DE = "deutsch"
_DE = [
    ("m", "Welcher Fall antwortet auf die Frage «Wem?»", ["Dativ", "Nominativ", "Genitiv", "Akkusativ"], "Nominativ wer/was, Genitiv wessen, Dativ wem, Akkusativ wen/was."),
    ("m", "Welcher Fall antwortet auf «Wessen?»", ["Genitiv", "Dativ", "Akkusativ", "Nominativ"], "Genitiv = Wessen-Fall."),
    ("m", "Welche Schreibweise ist richtig?", ["Rhythmus", "Rythmus", "Rhytmus", "Rytmus"], "Rhythmus mit «rh» und «th»."),
    ("m", "Welche Schreibweise ist richtig?", ["Adresse", "Addresse", "Adrese", "Addrese"], "Adresse mit einem d und zwei s."),
    ("m", "Wie lautet das Perfekt von «gehen» (er…)?", ["ist gegangen", "hat gegangen", "ist gegeht", "wurde gegangen"], "Bewegungsverben bilden das Perfekt mit «sein»."),
    ("m", "Wie lautet das Präteritum von «sehen» (ich…)?", ["sah", "sehte", "gesehen", "sieht"], "sehen – sah – gesehen."),
    ("m", "Wie lautet der Konjunktiv II von «haben» (ich…)?", ["hätte", "habe", "hatte", "hab"], "Konjunktiv II: ich hätte."),
    ("m", "Welcher Satz ist korrekt geschrieben?", ["Beim Lesen vergesse ich die Zeit.", "Beim lesen vergesse ich die Zeit.", "beim Lesen vergesse ich die Zeit.", "Beim Lesen Vergesse ich die Zeit."], "Nominalisierte Verben werden grossgeschrieben."),
    ("m", "Welches Wort ist ein Synonym für «beginnen»?", ["starten", "enden", "warten", "stoppen"], "Synonyme haben gleiche oder ähnliche Bedeutung."),
    ("m", "Welcher Satz ist korrekt?", ["Ich hoffe, dass du kommst.", "Ich hoffe dass, du kommst.", "Ich hoffe dass du, kommst.", "Ich, hoffe dass du kommst."], "Vor «dass» steht ein Komma."),
    ("m", "Welche Wortart ist «schnell»?", ["Adjektiv", "Nomen", "Verb", "Präposition"], "Adjektive beschreiben Eigenschaften."),
    ("m", "Welche Wortart ist «und»?", ["Konjunktion", "Pronomen", "Adverb", "Artikel"], "«und» verbindet Wörter oder Sätze."),
    ("m", "Was ist das Antonym von «Gewinn»?", ["Verlust", "Ertrag", "Erlös", "Vorteil"], "Gewinn ↔ Verlust."),
    ("m", "Welche Anrede passt in einen formellen Brief an eine bekannte Frau Meier?", ["Sehr geehrte Frau Meier", "Hallo Frau Meier", "Liebe Meier", "Hey Frau Meier"], "Formell: «Sehr geehrte Frau …»."),
    ("m", "Welcher Briefschluss ist in der Schweiz üblich?", ["Freundliche Grüsse", "Freundliche Grüße", "Mfg", "Ciao"], "In der Schweiz wird «ss» statt «ß» geschrieben."),
    ("m", "Wie schreibt man in der Schweizer Rechtschreibung «Straße»?", ["Strasse", "Straße", "Strase", "Strasze"], "Schweizer Schriftsprache kennt kein ß."),
    ("m", "Welche Frage ermittelt das Subjekt?", ["Wer oder was?", "Wem?", "Wann?", "Wo?"], "Subjekt = Nominativ."),
    ("m", "Welcher Satz steht im Passiv?", ["Der Brief wird geschrieben.", "Er schreibt den Brief.", "Er hat geschrieben.", "Schreib den Brief!"], "Passiv = werden + Partizip II."),
    ("m", "Welche Form ist richtig? «Ihr ___ herzlich eingeladen.»", ["seid", "seit", "seyd", "sied"], "«seid» = Form von «sein»; «seit» = zeitlich."),
    ("m", "Welche Form ist richtig? «Ich weiss, ___ er kommt.»", ["dass", "das", "dass'", "dasz"], "Konjunktion «dass» leitet einen Nebensatz ein."),
    ("m", "Was bedeutet «Rezeption»?", ["Empfang", "Rechnung", "Rezept", "Reklamation"], "Rezeption = Empfangsbereich."),
    ("m", "Was hält ein Protokoll fest?", ["Verlauf und Beschlüsse einer Sitzung", "Eine Meinung", "Eine Werbung", "Eine Geschichte"], "Protokolle dokumentieren Gesprächsinhalte sachlich."),
    ("m", "Von wem stammt das Vier-Ohren-Modell?", ["Friedemann Schulz von Thun", "Paul Watzlawick", "Sigmund Freud", "Albert Einstein"], "Sachinhalt, Selbstoffenbarung, Beziehung, Appell."),
    ("m", "Wie lautet der Plural von «Praktikum»?", ["Praktika", "Praktikums", "Praktikume", "Praktikas"], "Lateinischer Plural: Praktika."),
    ("m", "Welche Schreibweise von «Standard» ist richtig?", ["Standard", "Standart", "Stantard", "Standerd"], "Standard mit «d» am Ende."),
    ("t", "Im deutschen Aussagesatz steht das konjugierte Verb an zweiter Stelle.", True, "Verbzweitstellung."),
    ("t", "In der Schweiz schreibt man regelmässig das Zeichen «ß».", False, "Man schreibt stattdessen «ss»."),
    ("t", "Nomen werden im Deutschen grossgeschrieben.", True, "Alle Nomen beginnen mit Grossbuchstaben."),
    ("t", "Vor dem Wort «dass» steht normalerweise ein Komma.", True, "«dass» leitet einen Nebensatz ein."),
    ("t", "«Seit» bezieht sich auf einen Zeitpunkt oder eine Zeitspanne.", True, "Z. B. «seit gestern»."),
    ("t", "Viele Adjektive lassen sich steigern.", True, "Positiv, Komparativ, Superlativ."),
    ("t", "«Wieder» und «wider» bedeuten dasselbe.", False, "«wieder» = erneut, «wider» = gegen."),
    ("t", "«Standart» ist die richtige Schreibweise.", False, "Richtig ist «Standard»."),
    ("t", "Der Imperativ von «kommen» in der Du-Form lautet «komm!».", True, "Befehlsform."),
    ("t", "Ein Geschäftsbrief enthält in der Regel eine Betreffzeile.", True, "Sie nennt das Thema des Briefes."),
    ("t", "Die Frage «Wem?» führt zum Dativ.", True, "Dativ = Wem-Fall."),
    ("t", "Eine Zusammenfassung ist länger als der Originaltext.", False, "Sie ist kürzer."),
    ("t", "Verben werden konjugiert, Nomen werden dekliniert.", True, "Konjugation = Verben, Deklination = Nomen, Adjektive, Artikel."),
    ("g", "Der Plural von «Kind» ist ___.", "Kinder", "Plural mit -er."),
    ("g", "Das Gegenteil von «hell» ist ___.", "dunkel", "Antonym."),
    ("g", "Präsens: Er ___ gerne Pizza. (essen)", "isst", "essen – er isst."),
    ("g", "Steigerung: gut – besser – am ___.", "besten", "Superlativ von «gut»."),
    ("g", "Ich warte ___ dich. (Präposition)", "auf", "warten auf + Akkusativ."),
    ("g", "Ich helfe ___ Kunden. (bestimmter Artikel im Dativ, männlich)", "dem", "helfen + Dativ: dem Kunden."),
    ("g", "Das Satzglied, das aussagt, was jemand tut, heisst ___.", "Prädikat", "Prädikat = Verb im Satz."),
    ("g", "«Ich habe gegessen» steht in der Zeitform ___.", "Perfekt", "haben + Partizip II."),
    ("g", "Das Gegenteil von «Vorteil» ist ___.", "Nachteil", "Antonym."),
    ("g", "Der Beginn eines Briefes heisst ___ (z. B. «Sehr geehrte Frau Muster»).", "Anrede", "Anrede, dann Haupttext, dann Grussformel."),
    ("g", "Das Gegenteil von «kaufen» ist ___.", "verkaufen", "Antonym."),
    ("g", "Ein Wort mit gleicher Bedeutung wie ein anderes heisst ___.", "Synonym", "Gegenteil: Antonym."),
]

# ---------------------------------------------------------------- Englisch
EN = "englisch"
_EN = [
    ("m", "Choose the correct form: 'She ___ in London since 2019.'", ["has lived", "lives", "is living", "lived"], "'since' + present perfect."),
    ("m", "Choose the correct form: 'If I ___ rich, I would travel the world.'", ["were", "am", "will be", "was being"], "Second conditional uses 'were'."),
    ("m", "What is the plural of 'child'?", ["children", "childs", "childes", "childrens"], "Irregular plural."),
    ("m", "Choose the correct word: 'Could you ___ me the report?'", ["send", "sent", "sending", "sends"], "After 'could' use the base form."),
    ("m", "What is the past tense of 'go'?", ["went", "goed", "gone", "going"], "go – went – gone."),
    ("m", "What is the opposite of 'increase'?", ["decrease", "improve", "grow", "raise"], "Increase ↔ decrease."),
    ("m", "Choose the correct form: 'There ___ many customers today.'", ["are", "is", "was", "be"], "'customers' is plural."),
    ("m", "Complete: 'I look forward to ___ from you.'", ["hearing", "hear", "heard", "be hearing"], "'look forward to' + -ing."),
    ("m", "Complete: 'The deadline is ___ Friday.'", ["on", "at", "in", "by at"], "Days take 'on'."),
    ("m", "Complete: 'She arrives ___ 9 o'clock.'", ["at", "on", "in", "to"], "Clock times take 'at'."),
    ("m", "Which closing fits a letter that begins 'Dear Sir or Madam'?", ["Yours faithfully,", "Yours sincerely,", "Cheers,", "See you,"], "Unknown name → 'Yours faithfully'."),
    ("m", "What does 'invoice' mean in German?", ["Rechnung", "Lieferschein", "Angebot", "Bestellung"], "Invoice = Rechnung."),
    ("m", "What does 'delivery' mean in German?", ["Lieferung", "Zahlung", "Rückgabe", "Beratung"], "Delivery = Lieferung."),
    ("m", "What does 'appointment' mean in German?", ["Termin", "Angebot", "Anstellung", "Abteilung"], "Appointment = Termin."),
    ("m", "What are 'minutes' in a business context?", ["The written record of a meeting", "60 seconds", "A type of invoice", "A short break"], "Minutes = Protokoll."),
    ("m", "Complete: 'How ___ money do you need?'", ["much", "many", "more many", "few"], "'money' is uncountable → 'much'."),
    ("m", "What is the comparative of 'good'?", ["better", "gooder", "more good", "best"], "good – better – best."),
    ("m", "Complete: 'I'd like to ___ an appointment.'", ["make", "do", "take out", "build"], "make an appointment."),
    ("m", "Which sentence is correct?", ["He doesn't like coffee.", "He don't like coffee.", "He not likes coffee.", "He doesn't likes coffee."], "3rd person negative: doesn't + base form."),
    ("m", "Which word is a synonym of 'reply'?", ["answer", "ask", "order", "refuse"], "reply = answer."),
    ("m", "What does 'Please find attached…' mean?", ["Im Anhang finden Sie…", "Bitte antworten Sie…", "Bitte rufen Sie an…", "Bitte warten Sie…"], "Standard phrase in business emails."),
    ("m", "Complete: 'The goods ___ delivered yesterday.'", ["were", "was", "are", "have"], "Passive past plural: were delivered."),
    ("m", "What does 'discount' mean in German?", ["Rabatt", "Zoll", "Gebühr", "Steuer"], "Discount = Rabatt."),
    ("m", "What does 'colleague' mean?", ["Kollege/Kollegin", "Kunde", "Chef", "Lieferant"], "Colleague = Arbeitskollege."),
    ("m", "Which is a polite request?", ["Could you help me, please?", "Help me!", "You help now.", "Give help me."], "'Could you…, please?' is polite."),
    ("t", "'Furniture' is a countable noun in English.", False, "Furniture is uncountable (a piece of furniture)."),
    ("t", "'Advice' is uncountable.", True, "Say 'some advice' or 'a piece of advice'."),
    ("t", "'Yours sincerely' is used when you know the name of the person.", True, "'Dear Mr Smith… Yours sincerely'."),
    ("t", "'Their' and 'there' have the same meaning.", False, "'their' = ihr (Besitz), 'there' = dort."),
    ("t", "The present perfect is formed with have/has + past participle.", True, "e.g. 'I have worked'."),
    ("t", "'Staff' can refer to the employees of a company.", True, "Staff = Personal."),
    ("t", "'I am agree' is correct English.", False, "Correct: 'I agree.'"),
    ("t", "'Receipt' means Quittung.", True, "Receipt = Quittung, Beleg."),
    ("t", "'Lend' and 'borrow' mean the same.", False, "Lend = leihen (geben), borrow = ausleihen (nehmen)."),
    ("t", "'Hi there' is a formal greeting for business letters.", False, "It is informal."),
    ("t", "In the present simple, the third person singular usually takes an -s.", True, "he works, she goes."),
    ("t", "'Supplier' means Lieferant.", True, "Supplier = Lieferant."),
    ("t", "'Actually' means 'aktuell' in German.", False, "'actually' = eigentlich; 'aktuell' = current."),
    ("g", "The past tense of 'write' is ___.", "wrote", "write – wrote – written."),
    ("g", "The past participle of 'see' is ___.", "seen", "see – saw – seen."),
    ("g", "The opposite of 'buy' is ___.", "sell", "buy ↔ sell."),
    ("g", "Thank you ___ your email. (preposition)", "for", "thank you for…"),
    ("g", "The plural of 'company' is ___.", "companies", "consonant + y → ies."),
    ("g", "She is ___ than her brother. (tall)", "taller", "Comparative: taller."),
    ("g", "Mr Smith is ___ the phone. (preposition)", "on", "on the phone."),
    ("g", "The English word for 'Kunde' is ___.", "customer", "customer or client."),
    ("g", "The English word for 'Besprechung/Sitzung' is ___.", "meeting", "meeting."),
    ("g", "The English word for 'Lieferant' is ___.", "supplier", "supplier."),
    ("g", "A written price offer is called a ___.", "quotation", "quotation (or quote)."),
    ("g", "I have ___ working here since 2020. (be)", "been", "present perfect continuous: have been working."),
]


def _build(subject, rows):
    out = []
    for r in rows:
        if r[0] == "m":
            out.append(_mc(subject, r[1], r[2], r[3]))
        elif r[0] == "t":
            out.append(_tf(subject, r[1], r[2], r[3]))
        else:
            out.append(_gap(subject, r[1], r[2], r[3]))
    return out


KAUFMANN_QUESTIONS = (
    _build(RW, _RW) + _build(WG, _WG) + _build(IKA, _IKA) + _build(DE, _DE) + _build(EN, _EN)
)
