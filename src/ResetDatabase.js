import React, { useState } from 'react';
import PouchDB from 'pouchdb-browser';

const localDB = new PouchDB('responses');

const ResetDatabase = () => {
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <button onClick={handleReset} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Database'}
      </button>
    </div>
  );
};

export default ResetDatabase;
