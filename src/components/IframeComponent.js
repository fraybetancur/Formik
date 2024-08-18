/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { Box } from '@mui/material';

export const IframeComponent = () => {
  return (
    <Box css={iframeComponentStyles.container}>
      <iframe 
        src="https://cc.form-case.com/x/6nLGeMeM" 
        title="Form Case" 
        css={iframeComponentStyles.iframe}
        allowFullScreen
      />
    </Box>
  );
};

const iframeComponentStyles = {
  container: css`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
    height: 93vh; /* Ocupa toda la altura de la ventana */
    width: 100%;
    overflow: hidden;
    position: fixed;
  `,
  iframe: css`
    border: none;
    width: 100%;
    flex: 1; /* Ocupa todo el espacio disponible en el contenedor */
  `,
};

export default IframeComponent;
