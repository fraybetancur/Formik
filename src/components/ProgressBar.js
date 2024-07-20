/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';

const ProgressBar = ({ progress }) => (
  <div css={progressBarContainer}>
    <div css={progressBarFill(progress)}></div>
  </div>
);

const progressBarContainer = css`
  width: 100%;
  height: 19px;
  background-color: #e0e0df;
  border-radius: 5px;
  overflow: hidden;
`;

const progressBarFill = (progress) => css`
  height: 100%;
  width: ${progress}%;
  background-color: #76c7c0;
  transition: width 0.3s;
`;

export default ProgressBar;
