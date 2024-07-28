import React, { useEffect, useState } from 'react';
import PouchDB from 'pouchdb-browser';

// Inicializar las bases de datos locales
const databases = {
  responses: new PouchDB('responses'),
  survey: new PouchDB('survey'),
  choices: new PouchDB('choices')
};

const ResponsesList = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDB, setSelectedDB] = useState('responses');

  const fetchResponses = async (db) => {
    setLoading(true);
    setError(null);
    setResponses([]);

    try {
      const allDocs = await databases[db].allDocs({ include_docs: true });
      const fetchedResponses = allDocs.rows.map(row => row.doc);
      setResponses(fetchedResponses);
    } catch (err) {
      console.error(`Error fetching responses from PouchDB ${db}:`, err);
      setError(`Error fetching responses from ${db}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses(selectedDB);
  }, [selectedDB]);

  const handleDBChange = (event) => {
    setSelectedDB(event.target.value);
  };

  if (loading) return <p>Loading responses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Responses</h2>
      <div>
        <label htmlFor="db-select">Select Database:</label>
        <select id="db-select" value={selectedDB} onChange={handleDBChange}>
          <option value="responses">Responses</option>
          <option value="survey">Survey</option>
          <option value="choices">Choices</option>
        </select>
      </div>
      <ul>
        {responses.map(response => (
          <li key={response._id}>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResponsesList;
