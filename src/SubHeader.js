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

  // Función para manejar la sincronización de datos
  const handleSync = async () => {
    setLoading(true);
    try {
      console.log('Syncing data...');
      toast.info('Sincronizando datos...');
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
      const allDocs = await localDB.allDocs({ include_docs: true });
      const logMessages = [];
      const totalDocs = allDocs.rows.length;
      let successfulUploads = 0;

      for (const doc of allDocs.rows) {
        try {
          const { _id, _rev, ...docWithoutIdRev } = doc.doc;
          const response = await remoteDB.post(docWithoutIdRev);

          if (response.ok) {
            successfulUploads++;
            toast.success(`Subida exitosa: ${successfulUploads}/${totalDocs}`);
          }
          logMessages.push(`Uploaded response: ${_id}`);
        } catch (error) {
          if (error.status === 401) {
            toast.error('Error 401: No autorizado. Verifique sus credenciales.');
          } else if (error.status === 403) {
            toast.error('Error 403: Prohibido. No tiene permisos para realizar esta acción.');
          } else if (error.status === 404) {
            toast.error('Error 404: Recurso no encontrado.');
          } else if (error.status === 409) {
            toast.error('Error 409: Conflicto. El documento ya existe.');
          } else if (error.status === 412) {
            toast.error('Error 412: Condición previa fallida.');
          } else if (error.status === 500) {
            toast.error('Error 500: Error interno del servidor.');
          } else if (error.status === 503) {
            toast.error('Error 503: Servicio no disponible.');
          } else {
            toast.error(`Error ${error.status}: ${error.message}`);
          }
          logMessages.push(`Error uploading response: ${doc.doc._id}`);
        }
      }

      setLog(logMessages);
      if (successfulUploads === totalDocs) {
        toast.success(`Respuestas subidas con éxito a Cloudant. Total: ${successfulUploads}/${totalDocs}`);
      } else {
        toast.warn(`Algunas respuestas no se pudieron subir. Total: ${successfulUploads}/${totalDocs}`);
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
