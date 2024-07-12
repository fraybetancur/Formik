import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

// Inicializamos las bases de datos locales y remotas de PouchDB para survey
const surveyDb = new PouchDB('survey');
const remoteSurveyDb = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
  },
});

// Inicializamos las bases de datos locales y remotas de PouchDB para choices
const choicesDb = new PouchDB('choices');
const remoteChoicesDb = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/choices`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_CHOICES,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_CHOICES,
  },
});

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
      alert('Datos sincronizados exitosamente');
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
      {loading && <p>Cargando...</p>}
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
