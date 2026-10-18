import React, { useState } from 'react';

export default function Admin() {
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedProfForCode, setSelectedProfForCode] = useState('Alle Berufe');
  const [maxUses, setMaxUses] = useState('0');

  // Alle Berufe und Fächer für den Generator & Import
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
  const [count, setCount] = useState('10 Fragen');

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
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', background: '#fcfbf9', minHeight: '100vh' }}>
      
      {/* Header & Statistik */}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold' }}>
        🔑 Admin-Dashboard
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', border: '2px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>12</div>
          <div style={{ fontSize: '12px', color: '#666' }}>NUTZER &gt;</div>
        </div>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', border: '2px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>9</div>
          <div style={{ fontSize: '12px', color: '#666' }}>FREIGESCHALTET &gt;</div>
        </div>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', border: '2px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>8</div>
          <div style={{ fontSize: '12px', color: '#666' }}>CODES</div>
        </div>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', border: '2px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>5</div>
          <div style={{ fontSize: '12px', color: '#666' }}>AKTIV</div>
        </div>
      </div>

      {/* Groq KI-Fragen-Generator */}
      <div style={{ background: '#bbf246', padding: '20px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          ✨ Groq (GPT-OSS 20B) KI-Fragen-Generator (Gefiltert & Konfigurierbar)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Beruf wählen:</label>
            <select value={selectedProfession} onChange={handleProfessionChange} style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '6px', background: '#fff', fontWeight: 'bold' }}>
              {Object.keys(professionsData).map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Passendes Fach:</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '6px', background: '#fff', fontWeight: 'bold' }}>
              {professionsData[selectedProfession]?.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Anzahl Fragen:</label>
            <select value={count} onChange={(e) => setCount(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '6px', background: '#fff', fontWeight: 'bold' }}>
              <option>10 Fragen</option>
              <option>25 Fragen</option>
              <option>50 Fragen</option>
            </select>
          </div>
        </div>

        <button style={{ width: '100%', background: '#000', color: '#fff', border: '2px solid #000', padding: '14px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' }}>
          ✨ Fragen mit Groq (GPT-OSS 20B) generieren & hochladen
        </button>
      </div>

      {/* Detaillierter Lizenzcode-Ersteller */}
      <div style={{ background: '#fef08a', padding: '20px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Neuen Code erstellen
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="CODE (LEER = AUTO)" 
            value={newCode} 
            onChange={(e) => setNewCode(e.target.value)}
            style={{ padding: '10px', border: '2px solid #000', borderRadius: '6px', background: '#fff', fontWeight: 'bold' }} 
          />
          <input 
            type="text" 
            placeholder="Notiz (optional)" 
            value={newNote} 
            onChange={(e) => setNewNote(e.target.value)}
            style={{ padding: '10px', border: '2px solid #000', borderRadius: '6px', background: '#fff' }} 
          />
          <select 
            value={selectedProfForCode} 
            onChange={(e) => setSelectedProfForCode(e.target.value)}
            style={{ padding: '10px', border: '2px solid #000', borderRadius: '6px', background: '#fff' }}
          >
            <option>Alle Berufe</option>
            {Object.keys(professionsData).map(prof => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={maxUses} 
            onChange={(e) => setMaxUses(e.target.value)}
            style={{ padding: '10px', border: '2px solid #000', borderRadius: '6px', background: '#fff', textAlign: 'center' }} 
          />
        </div>
        <button style={{ width: '100%', background: '#000', color: '#fff', border: '2px solid #000', padding: '14px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}>
          + Code erstellen
        </button>
      </div>

      {/* Neuer Admin-Import-Bereich mit Import-Button */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
          📂 Admin-Import (Fragen-Datenbank befüllen)
        </h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
          Lade eine JSON-Datei hoch oder füge den JSON-Code ein, um deine Fragen direkt in die Datenbank zu importieren.
        </p>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>JSON-Datei hochladen:</label>
          <input type="file" accept=".json,.txt" onChange={handleFileUpload} style={{ border: '2px solid #000', padding: '8px', borderRadius: '6px', width: '100%', background: '#f9f9f9' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Oder JSON-Code direkt einfügen:</label>
          <textarea 
            rows="6" 
            style={{ width: '100%', padding: '10px', fontFamily: 'monospace', border: '2px solid #000', borderRadius: '6px', background: '#f9f9f9' }}
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

        {statusMessage && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{statusMessage}</p>}
      </div>

    </div>
  );
}
