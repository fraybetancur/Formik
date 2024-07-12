import React, { useContext } from 'react';
import { QuestionContext } from './QuestionContext';

const DataSyncButton = () => {
  const { syncData, isSyncing, error } = useContext(QuestionContext);

  return (
    <div>
      <button onClick={syncData} disabled={isSyncing}>
        {isSyncing ? 'Sincronizando...' : 'Sync Data'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default DataSyncButton;
