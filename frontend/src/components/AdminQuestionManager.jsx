import React, { useState } from 'react';

export default function AdminQuestionManager() {
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Alle Berufe und deren Fächer gemäss Auswahlobersicht
  const professionsData = {
    "Kaufmann/-frau EFZ (D&D)": ["RW", "BWL", "VWL", "IKA", "DE", "EN", "FR", "ABU"],
    "Elektroinstallateur/in EFZ": ["ETG", "NIN", "ST", "MT", "DE", "EN", "ABU"],
    "Fachfrau/-mann Gesundheit EFZ (FaGe)": ["PFLEGE", "MED", "HE", "DE", "EN", "ABU"],
    "Informatiker/in EFZ": ["PRG", "NET", "SEC", "DE", "EN", "ABU"],
    "Coiffeur/-euse EFZ": ["HK", "FC", "SM", "DE", "ABU"],
    "Logistiker/in EFZ": ["LL", "TV", "ASL", "DE", "ABU"],
    "Detailhandelsfachmann/-frau EFZ": ["VB", "WB", "BKDH", "DE", "EN", "ABU"],
    "Theorieprüfung Auto (Kat. B)": ["VR", "VK", "FTP"],
    "Fachfrau/-mann Betreuung EFZ (FaBe)": ["EP", "SRK", "GPF", "DE", "ABU"],
    "Polymechaniker/in EFZ": ["FT", "WMT", "CAD", "MTH", "ETS", "DE", "ABU"],
    "Mediamatiker/in EFZ": ["DM", "MPR", "ICTM", "DE", "EN", "ABU"],
    "Hotelfachmann/-frau EFZ": ["GAS", "HKR", "REC", "DE", "EN", "FR", "ABU"],
    "Pharma-Assistent/in EFZ": ["PHARM", "GAL", "OTC", "DE", "ABU"]
  };

  const [selectedProfession, setSelectedProfession] = useState(Object.keys(professionsData)[0]);
  const [selectedSubject, setSelectedSubject] = useState(professionsData[selectedProfession][0]);
  const [count, setCount] = useState('50 Fragen');

  // Aktualisiere Fächer automatisch, wenn der Beruf gewechselt wird
  const handleProfessionChange = (e) => {
    const prof = e.target.value;
    setSelectedProfession(prof);
    if (professionsData[prof] && professionsData[prof].length > 0) {
      setSelectedSubject(professionsData[prof][0]);
    }
  };

  const handleImport = async () => {
    try {
      const questions = JSON.parse(jsonInput);
      if (!Array.isArray(questions)) {
        alert('Das Format muss ein Array von Fragen sein ([...])');
        return;
      }

      setStatusMessage(`Importiere ${questions.length} Fragen...`);

      for (const q of questions) {
        await fetch('/api/entities/Question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q)
        });
      }

      setStatusMessage('Erfolgreich alle Fragen importiert!');
      setJsonInput('');
    } catch (error) {
      console.error(error);
      setStatusMessage('Fehler beim Parsen oder Importieren. Bitte JSON-Format prüfen.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setJsonInput(e.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0' }}>
      
      {/* Groq (GPT-OSS 20B) KI-Fragen-Generator Sektion */}
      <div style={{ background: '#bbf246', padding: '20px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
          ✨ Groq (GPT-OSS 20B) KI-Fragen-Generator (Gefiltert & Konfigurierbar)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>Beruf wählen:</label>
            <select value={selectedProfession} onChange={handleProfessionChange} style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '6px', background: '#fff' }}>
              {Object.keys(professionsData).map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>Passendes Fach:</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '6px', background: '#fff' }}>
              {professionsData[selectedProfession]?.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>Anzahl Fragen:</label>
            <select value={count} onChange={(e) => setCount(e.target.value)} style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '6px', background: '#fff' }}>
              <option>10 Fragen</option>
              <option>25 Fragen</option>
              <option>50 Fragen</option>
            </select>
          </div>
        </div>

        <button style={{ width: '100%', background: '#000', color: '#fff', border: '2px solid #000', padding: '12px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}>
          ✨ Fragen mit Groq (GPT-OSS 20B) generieren & hochladen
        </button>
      </div>

      {/* Admin-Import Sektion mit Import-Button */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
          📂 Admin-Import (Fragen-Datenbank befüllen)
        </h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
          Lade eine JSON-Datei hoch oder füge den JSON-Code ein, um die Fragen aller Berufe und Fächer direkt in deine Datenbank zu importieren.
        </p>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>JSON-Datei hochladen:</label>
          <input type="file" accept=".json,.txt" onChange={handleFileUpload} style={{ border: '2px solid #000', padding: '8px', borderRadius: '6px', width: '100%' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Oder JSON-Code direkt einfügen:</label>
          <textarea 
            rows="6" 
            style={{ width: '100%', padding: '10px', fontFamily: 'monospace', border: '2px solid #000', borderRadius: '6px' }}
            placeholder='[{"question": "...", "options": [...], "correct": 0, "subject": "...", "profession": "..."}]'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        </div>

        <button 
          onClick={handleImport}
          style={{ background: '#4ade80', color: '#000', border: '3px solid #000', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px', boxShadow: '2px 2px 0px #000' }}
        >
          🚀 Fragen jetzt in Datenbank importieren
        </button>

        {statusMessage && <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>{statusMessage}</p>}
      </div>

    </div>
  );
}
