import React, { useEffect, useState } from 'react';
import PouchDB from 'pouchdb-browser';

const localDB = new PouchDB('responses');

const ResponsesList = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const allDocs = await localDB.allDocs({ include_docs: true });
        const fetchedResponses = allDocs.rows.map(row => row.doc);
        setResponses(fetchedResponses);
      } catch (err) {
        console.error('Error fetching responses from PouchDB:', err);
        setError('Error fetching responses.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  if (loading) return <p>Loading responses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Responses</h2>
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
