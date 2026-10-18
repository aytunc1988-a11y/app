import React, { useState } from 'react';

export default function QuestionImportAdmin() {
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '2px solid #000', margin: '20px 0' }}>
      <h3>📦 Admin-Bereich: Fragen-Import</h3>
      <p>Lade eine JSON-Datei hoch oder füge den Code direkt ein, um die 50 Fragen pro Fach in die Datenbank zu laden.</p>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>JSON-Datei auswählen:</label>
        <input type="file" accept=".json,.py" onChange={handleFileUpload} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Oder JSON-Daten hier einfügen:</label>
        <textarea 
          rows="8" 
          style={{ width: '100%', padding: '10px', fontFamily: 'monospace' }}
          placeholder='[{"question": "...", "options": [...], "correct": 0, "subject": "...", "profession": "..."}]'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
      </div>

      <button 
        onClick={handleImport}
        style={{ background: '#bbf246', border: '2px solid #000', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
      >
        🚀 Fragen in Datenbank importieren
      </button>

      {statusMessage && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{statusMessage}</p>}
    </div>
  );
}
