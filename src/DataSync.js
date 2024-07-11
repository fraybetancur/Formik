import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const surveyDb = new PouchDB('survey');
const remoteSurveyDb = new PouchDB('https://apikey-ad5815b4338243e1ac10394e732b53bf:f98a18155d05cfc220979bec6f22692d9fc87ef8@c9efcc17-6575-4ea9-9190-1faaa775d47e-bluemix.cloudantnosqldb.appdomain.cloud/survey');

const choicesDb = new PouchDB('choices');
const remoteChoicesDb = new PouchDB('https://apikey-508b08635fd44b62b1f730ff8f41b3bc:5817cdb3e77e735c55714cc9f736943c24501f5d@c9efcc17-6575-4ea9-9190-1faaa775d47e-bluemix.cloudantnosqldb.appdomain.cloud/choices');

// Aumentar el límite de listeners permitidos
surveyDb.setMaxListeners(20);
remoteSurveyDb.setMaxListeners(20);
choicesDb.setMaxListeners(20);
remoteChoicesDb.setMaxListeners(20);

const DataSync = () => {
  const [data, setData] = useState({ surveyData: [], choicesData: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const syncWithRetry = async (db, remoteDb, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        await db.sync(remoteDb, { live: false, retry: true });
        console.log("Sincronización completada.");
        return;
      } catch (err) {
        console.error(`Error en el intento ${i + 1}:`, err);
        if (i === retries - 1) throw err;
        await delay(1000 * Math.pow(2, i)); // Exponential backoff
      }
    }
  };

  const syncData = async () => {
    try {
      console.log("Iniciando sincronización...");
      setLoading(true);
      await syncWithRetry(surveyDb, remoteSurveyDb);
      await syncWithRetry(choicesDb, remoteChoicesDb);

      const surveyResult = await surveyDb.allDocs({ include_docs: true });
      const choicesResult = await choicesDb.allDocs({ include_docs: true });
      setData({
        surveyData: surveyResult.rows.map(row => row.doc),
        choicesData: choicesResult.rows.map(row => row.doc),
      });
      console.log("Sincronización completada.");
      alert('Data synced successfully');
    } catch (err) {
      console.error("Error durante la sincronización:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const surveyResult = await surveyDb.allDocs({ include_docs: true });
        const choicesResult = await choicesDb.allDocs({ include_docs: true });
        setData({
          surveyData: surveyResult.rows.map(row => row.doc),
          choicesData: choicesResult.rows.map(row => row.doc),
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <button onClick={syncData}>Sync Data</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div>
        <h2>Datos de Survey</h2>
        <pre>{JSON.stringify(data.surveyData, null, 2)}</pre>
      </div>
      <div>
        <h2>Datos de Choices</h2>
        <pre>{JSON.stringify(data.choicesData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DataSync;
