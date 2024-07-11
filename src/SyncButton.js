import React, { useState } from 'react';
import PouchDB from 'pouchdb';

const SyncButton = ({ onSyncComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const remoteDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
    adapter: 'http',
    auth: {
      username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
      password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
    },
  });

  const localDB = new PouchDB('survey');

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await localDB.replicate.from(remoteDB);
      console.log('Synchronization complete');
      onSyncComplete();
    } catch (error) {
      console.error('Failed to sync:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleSync} disabled={isLoading}>
      {isLoading ? 'Sincronizando...' : 'Sincronizar'}
    </button>
  );
};

export default SyncButton;
