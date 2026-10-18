import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getProfession, professionSubjects } from '../lib/subjects';

export default function BerufDetail() {
  const { id } = useParams();
  const profession = getProfession(id);
  const subjects = professionSubjects(id);

  useEffect(() => {
    if (profession) {
      document.title = `LAP Vorbereitung ${profession.name} | LAP QUIZ`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = `Effiziente Prüfungsvorbereitung für ${profession.name}. Lerne mit interaktiven Fragen, KI-Erklärungen und alten Prüfungen auf LAP QUIZ.`;
    }
  }, [profession]);

  if (!profession) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Beruf nicht gefunden</h1>
        <Link to="/berufe" className="text-blue-600 underline mt-4 inline-block">Zurück zur Berufsübersicht</Link>
      </div>
    );
  }

  return (
    <main className="modern-profession-detail">
      <div className="modern-profession-detail-content max-w-4xl mx-auto px-4 py-6">
        <Link to="/" className="modern-profession-back">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
        </Link>
        <div className="modern-page space-y-8">
          <div className={`modern-profession-hero p-8 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${profession.bg} flex items-center gap-6`}>
            <span className="text-6xl grid place-items-center w-20 h-20 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {profession.emoji}
            </span>
            <div>
              <h1 className="text-3xl font-heading font-black">LAP Vorbereitung: {profession.name}</h1>
              <p className="font-bold text-black/80 mt-2">
                Die Schweizer Lernplattform für deine Lehrabschlussprüfung (LAP). Starte jetzt mit zielgerichteten Prüfungsfragen und lerne optimal.
              </p>
            </div>
          </div>

          <div className="modern-profession-subjects bg-white border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-2xl font-heading font-black">Lernbereiche zur Prüfungsvorbereitung</h2>
            <p className="text-sm font-bold text-gray-700">
              Die Kürzel entsprechen den bereitgestellten Berufskategorien. Verbindlich sind die aktuellen Qualifikationsverfahren und Bildungspläne des jeweiligen Berufs.
            </p>
            {profession.sourceUrl && (
              <a
                href={profession.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-black underline underline-offset-4"
              >
                Offizieller SBFI-Berufseintrag <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="modern-profession-subject p-4 border-2 border-black rounded-xl bg-gray-50 flex items-center justify-between">
                  <span className="font-black">{subject.emoji} {subject.name}</span>
                  <Link
                    to={`/faecher?profession=${id}`}
                    className="modern-profession-practice px-3 py-1 bg-yellow-300 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    Fragen üben →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="modern-profession-benefits bg-blue-50 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-2xl font-heading font-black">Warum LAP QUIZ für {profession.name}?</h2>
            <ul className="list-disc pl-5 space-y-2 font-bold text-sm text-gray-800">
              <li>Realistische Prüfungsfragen im Multiple-Choice-, Wahr/Falsch- und Lückentext-Format.</li>
              <li>Detaillierte Erklärungen zu jeder Antwort für maximalen Lerneffekt.</li>
              <li>Kostenlose Kleinanzeigen und Skript-Tausch mit anderen Lernenden in deiner Region.</li>
              <li>Optimiert für Smartphone, Tablet und PC.</li>
            </ul>
            <div className="pt-4">
              <Link
                to="/register"
                className="modern-profession-cta inline-block px-6 py-3 bg-black text-white font-black border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-yellow-300 hover:text-black transition-all"
              >
                Jetzt kostenlos Account erstellen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
