/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { useContext } from 'react';
import { QuestionContext } from './QuestionContext';

const QuestionLoader = () => {
  const { syncData } = useContext(QuestionContext);

  return (
    <div css={css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: Arial, sans-serif;
    `}>
      <button 
        onClick={syncData}
        css={css`
          padding: 10px 20px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
        `}
      >
        Sincronizar
      </button>
    </div>
  );
};

export default QuestionLoader;
