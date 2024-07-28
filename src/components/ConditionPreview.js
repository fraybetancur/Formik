/** @jsxImportSource @emotion/react */
import React from 'react';
import { Card } from 'antd';
import { css } from '@emotion/react';

const cardStyle = css`
  margin: 1rem 0;
`;

const ConditionPreview = ({ conditions }) => (
  <Card css={cardStyle} title="Vista Previa de Condiciones">
    {conditions.map((condition, index) => (
      <p key={index}>
        {`Si ${condition.question} ${condition.operator} ${condition.value}`}
      </p>
    ))}
  </Card>
);

export default ConditionPreview;
