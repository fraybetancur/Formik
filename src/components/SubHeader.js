/** @jsxImportSource @emotion/react */
import React, { useContext } from 'react';
import { css } from '@emotion/react';
import { FaSyncAlt, FaTrashAlt, FaCloudUploadAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QuestionContext } from './QuestionContext';

const SubHeader = () => {
  const { syncData, handleUpload, handleReset, isSyncing, isUploading, isResetting } = useContext(QuestionContext);

  const handleSyncClick = async () => {
    try {
      await syncData();
      toast.success('Sincronización completada.');
    } catch (error) {
      toast.error('Error al sincronizar datos.');
    }
  };

  const handleUploadClick = async () => {
    try {
      await handleUpload();
      toast.success('Datos subidos a Cloudant.');
    } catch (error) {
      toast.error('Error al subir datos.');
    }
  };

  const handleResetClick = async () => {
    try {
      await handleReset();
      toast.success('Base de datos restablecida con éxito.');
    } catch (error) {
      toast.error('Error al restablecer la base de datos.');
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
      <button onClick={handleSyncClick} disabled={isSyncing || isUploading || isResetting} css={buttonSh}>
        <FaSyncAlt />
      </button>
      <button onClick={handleResetClick} disabled={isSyncing || isUploading || isResetting} css={buttonSh}>
        <FaTrashAlt />
      </button>
      <button onClick={handleUploadClick} disabled={isSyncing || isUploading || isResetting} css={buttonSh}>
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
