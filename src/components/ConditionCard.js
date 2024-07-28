/** @jsxImportSource @emotion/react */
import React from 'react';
import { Card, Button } from 'antd';
import { css } from '@emotion/react';

const cardStyle = css`
  margin: 1rem 0;
`;

const ConditionCard = ({ question, onAddCondition }) => (
  <Card css={cardStyle} title={question.QuestionText}>
    <Button type="primary" onClick={() => onAddCondition(question)}>
      Agregar Condición
    </Button>
  </Card>
);

export default ConditionCard;
