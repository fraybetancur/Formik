import React, { useState } from 'react';
import PouchDB from 'pouchdb-browser';

const localDB = new PouchDB('responses');

const UploadToCloudant = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [logMessages, setLogMessages] = useState([]);

  const uploadData = async () => {
    setUploading(true);
    setUploadMessage('Uploading...');

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

      for (const doc of allDocs.rows) {
        try {
          // Elimina _id y _rev si existen
          const { _id, _rev, ...docWithoutIdRev } = doc.doc;
          await remoteDB.post(docWithoutIdRev);
          logMessages.push(`Uploaded response: ${_id}`);
        } catch (error) {
          logMessages.push(`Error uploading response: ${doc.doc._id}`);
        }
      }

      setLogMessages(logMessages);
      setUploadMessage('Responses uploaded successfully to Cloudant.');
    } catch (error) {
      console.error("Error subiendo las respuestas a Cloudant:", error);
      setUploadMessage('Error subiendo las respuestas a Cloudant.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button onClick={uploadData} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload to Cloudant'}
      </button>
      <p>{uploadMessage}</p>
      <div>
        <h2>Upload Log</h2>
        {logMessages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  );
};

export default UploadToCloudant;
