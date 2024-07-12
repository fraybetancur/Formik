/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { FaSyncAlt, FaTrashAlt, FaCloudUploadAlt } from 'react-icons/fa';
import PouchDB from 'pouchdb-browser';
import axios from 'axios';

// Inicializamos la base de datos local
const localDB = new PouchDB('responses');

const SubHeader = () => {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);

  // Función para manejar la sincronización de datos
  const handleSync = async () => {
    setLoading(true);
    try {
      // Lógica para sincronizar datos aquí
      console.log('Syncing data...');
      // Simulamos la sincronización
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error syncing data:', error);
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
      alert('Database reset successful');
    } catch (error) {
      console.error('Error resetting the database:', error);
      alert('Failed to reset the database');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la subida de datos a Cloudant
  const handleUpload = async () => {
    setLoading(true);
    const logMessages = [];
    try {
      const allDocs = await localDB.allDocs({ include_docs: true });
      const responses = allDocs.rows.map(row => row.doc);
      const remoteDBUrl = `${process.env.REACT_APP_CLOUDANT_URL}/responses`;

      for (const response of responses) {
        try {
          // Subir cada respuesta a Cloudant
          await axios.post(remoteDBUrl, response, {
            auth: {
              username: process.env.REACT_APP_CLOUDANT_APIKEY_RESPONSES,
              password: process.env.REACT_APP_CLOUDANT_PASSWORD_RESPONSES,
            },
          });
          logMessages.push(`Response uploaded successfully: ${response._id}`);
        } catch (error) {
          logMessages.push(`Error uploading response: ${response._id}`);
        }
      }
      setLog(logMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading responses:', error);
      setLog([...logMessages, 'Error uploading responses']);
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
      <button onClick={handleSync} disabled={loading} css={buttonSh}>
        <FaSyncAlt />
      </button>
      <button onClick={handleReset} disabled={loading} css={buttonSh}>
        <FaTrashAlt />
      </button>
      <button onClick={handleUpload} disabled={loading} css={buttonSh}>
        <FaCloudUploadAlt />
      </button>
      {loading && <div>Loading...</div>}
      <div>
        {log.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  );
};

const buttonSh = css`
  margin: 0.5rem;
  padding: 0.5rem;
  background-color: #08c ;
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
