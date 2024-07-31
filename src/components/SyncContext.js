// SyncContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { toast } from 'react-toastify';

PouchDB.plugin(PouchDBFind);

const localSurveyDB = new PouchDB('survey');
const localChoicesDB = new PouchDB('choices');
const localResponsesDB = new PouchDB('responses');
const remoteSurveyDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
  },
});
const remoteChoicesDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/choices`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_CHOICES,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_CHOICES,
  },
});
const remoteResponsesDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/responses`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_RESPONSES,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_RESPONSES,
  },
});

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState({ choices: false, survey: false, responses: false });
  const [progress, setProgress] = useState({ choices: 0, survey: 0, responses: 0 });
  const [error, setError] = useState(null);
  const [indexesCreated, setIndexesCreated] = useState(false);

  const createIndexesAndFilters = useCallback(async () => {
    if (indexesCreated) return;
    try {
      console.log("Creando índices y filtros en Cloudant...");
      const designDoc = {
        _id: '_design/my_filter',
        filters: {
          by_organization_program: function (doc, req) {
            if (req.query.Organization && req.query.Program) {
              return doc.Organization === req.query.Organization && doc.Program === req.query.Program;
            }
            if (req.query.Organization) {
              return doc.Organization === req.query.Organization;
            }
            return true;
          }.toString(),
        },
      };

      const putDesignDoc = async (db) => {
        try {
          await db.put(designDoc);
        } catch (err) {
          if (err.status !== 409) throw err;
          console.log(`Documento de diseño ya existe en ${db.name}`);
        }
      };

      await Promise.all([
        putDesignDoc(remoteSurveyDB),
        putDesignDoc(remoteChoicesDB),
        putDesignDoc(remoteResponsesDB),
      ]);

      console.log('Índices y filtros creados en Cloudant.');
      console.log("Creando índices en PouchDB...");

      await Promise.all([
        localSurveyDB.createIndex({ index: { fields: ['Organization', 'Program'] } }),
        localChoicesDB.createIndex({ index: { fields: ['QuestionID'] } }),
        localResponsesDB.createIndex({ index: { fields: ['Organization', 'Program'] } }),
      ]);

      console.log('Índices creados en PouchDB.');
      setIndexesCreated(true);
    } catch (err) {
      console.error('Error creando índices y filtros:', err);
    }
  }, [indexesCreated]);

  useEffect(() => {
    createIndexesAndFilters();
  }, [createIndexesAndFilters]);

  const syncWithFilter = useCallback(async (localDB, remoteDB, organizationId, programId, dbName) => {
    return new Promise((resolve, reject) => {
      let docs_written = 0;
      let total_docs = 0;

      remoteDB.info().then(info => {
        total_docs = info.update_seq;
      });

      const retrySync = (retryCount, delay = 2000) => {
        if (retryCount > 0) {
          setTimeout(() => {
            syncWithFilter(localDB, remoteDB, organizationId, programId, dbName)
              .then(resolve)
              .catch(() => retrySync(retryCount - 1, delay * 2));
          }, delay);
        } else {
          reject(new Error(`Failed to replicate ${dbName} after multiple attempts`));
        }
      };

      localDB.replicate.from(remoteDB, {
        filter: 'my_filter/by_organization_program',
        query_params: { Organization: organizationId, Program: programId },
        live: false,
        retry: false,
        batch_size: 1500,
        batches_limit: 1500,
      }).on('change', info => {
        console.log(`Change detected in ${dbName}:`, info);
        docs_written = info.last_seq || docs_written;
        const progressPercentage = total_docs > 0 ? (docs_written / total_docs) * 100 : 0;
        setProgress(prev => ({ ...prev, [dbName]: progressPercentage }));
      }).on('complete', info => {
        console.log(`Replication complete for ${dbName}:`, info);
        setProgress(prev => ({ ...prev, [dbName]: 100 }));
        setSyncCompleted(prev => ({ ...prev, [dbName]: true }));
        resolve(info);
      }).on('error', err => {
        console.error(`Error replicating ${dbName}:`, err);
        setError(`Error replicating ${dbName}: ${err.message}`);
        retrySync(3);
      });
    });
  }, []);

  const syncDataWithParams = useCallback(async (organizationId, programId) => {
    try {
      console.log("Starting synchronization...");
      setIsSyncing(true);
      setSyncCompleted({ choices: false, survey: false, responses: false });

      const syncPromises = [
        syncWithFilter(localSurveyDB, remoteSurveyDB, organizationId, programId, 'survey'),
        syncWithFilter(localChoicesDB, remoteChoicesDB, organizationId, programId, 'choices'),
        syncWithFilter(localResponsesDB, remoteResponsesDB, organizationId, programId, 'responses'),
      ];

      await Promise.all(syncPromises);
      console.log("Synchronization completed.");
      toast.success('Data successfully synchronized');
    } catch (err) {
      console.error("Error during synchronization:", err);
      setError(err.message);
      toast.error('Error during synchronization.');
    } finally {
      setIsSyncing(false);
    }
  }, [syncWithFilter]);

  return (
    <SyncContext.Provider value={{ syncDataWithParams, isSyncing, syncCompleted, progress, error, localSurveyDB, localChoicesDB, localResponsesDB }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSyncContext = () => useContext(SyncContext);
export { localSurveyDB, localChoicesDB, localResponsesDB };
