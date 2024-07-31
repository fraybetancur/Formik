import React, { useEffect } from 'react';
import { useSyncContext } from './SyncContext';
import { useQuestionContext } from './QuestionContext';

const SyncManager = () => {
  const { syncDataWithParams, handleBackupSync, isSyncing } = useSyncContext();
  const { organizationId, programId } = useQuestionContext();

  useEffect(() => {
    const handleOnline = () => {
      console.log("Conexión a Internet detectada. Iniciando sincronización automática...");
      syncDataWithParams(organizationId, programId);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncDataWithParams, organizationId, programId]);

  return null; // Este componente no renderiza nada
};

export default SyncManager;
