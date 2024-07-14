/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { FaSyncAlt, FaTrashAlt, FaCloudUploadAlt } from 'react-icons/fa';
import PouchDB from 'pouchdb-browser';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Inicializamos la base de datos local
const localDB = new PouchDB('responses');

const SubHeader = () => {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Función para manejar la sincronización de datos
  const handleSync = async () => {
    setLoading(true);
    try {
      // Lógica para sincronizar datos aquí
      console.log('Syncing data...');
      toast.info('Sincronizando datos...');
      // Simulamos la sincronización
      setTimeout(() => {
        setLoading(false);
        toast.success('Sincronización completada.');
      }, 1000);
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Error al sincronizar datos.');
      setLoading(false);
    }
  };

  // Función para manejar el reseteo de la base de datos
  const handleReset = async () => {
    setLoading(true);
    try {
      const allDocs = await localDB.allDocs();
      const deleteDocs = allDocs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      }));
      await localDB.bulkDocs(deleteDocs);
      toast.success('Base de datos restablecida con éxito.');
    } catch (error) {
      console.error('Error resetting the database:', error);
      toast.error('Error al restablecer la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la subida de datos a Cloudant
  const handleUpload = async () => {
    setLoading(true);
    toast.info('Subiendo datos...');
    const remoteDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/responses`, {
      adapter: 'http',
      auth: {
        username: process.env.REACT_APP_CLOUDANT_APIKEY_RESPONSES,
        password: process.env.REACT_APP_CLOUDANT_PASSWORD_RESPONSES,
      },
    });
  
    try {
      const allDocs = await localDB.allDocs({ include_docs: true, attachments: true });
      const logMessages = [];
      let successCount = 0;
      let errorCount = 0;
  
      for (const doc of allDocs.rows) {
        try {
          const { _id, _rev, ...docWithoutIdRev } = doc.doc;
          const docWithAttachments = { ...docWithoutIdRev, _attachments: doc.doc._attachments };
          const response = await remoteDB.put({
            _id,
            ...docWithAttachments
          });
  
          if (response.ok) {
            logMessages.push(`Subida exitosa: ${_id}`);
            successCount++;
          } else {
            logMessages.push(`Error: ${response.error} - ${response.reason}`);
            errorCount++;
          }
        } catch (error) {
          logMessages.push(`Error uploading response: ${doc.doc._id} - ${error.message}`);
          errorCount++;
        }
      }
  
      setLog(logMessages);
      setSuccessCount(successCount);
      setErrorCount(errorCount);
  
      if (successCount > 0) {
        toast.success(`Respuestas subidas con éxito a Cloudant. Total: ${successCount}/${allDocs.rows.length}`);
      }
      if (errorCount > 0) {
        toast.error(`Errores al subir respuestas a Cloudant. Total: ${errorCount}/${allDocs.rows.length}`);
      }
    } catch (error) {
      console.error("Error subiendo las respuestas a Cloudant:", error);
      toast.error('Error subiendo las respuestas a Cloudant.');
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div css={css`
      display: flex;
      justify-content: flex-end;
      padding: 1rem;
      background-color: #fff;
      color: black;
    `}>
      <ToastContainer />
      <button onClick={handleSync} disabled={loading} css={buttonSh}>
        <FaSyncAlt />
      </button>
      <button onClick={handleReset} disabled={loading} css={buttonSh}>
        <FaTrashAlt />
      </button>
      <button onClick={handleUpload} disabled={loading} css={buttonSh}>
        <FaCloudUploadAlt />
      </button>
    </div>
  );
};

const buttonSh = css`
  margin: 0.5rem;
  padding: 0.5rem;
  background-color: #08c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #007cba;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export default SubHeader;