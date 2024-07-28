/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { Select, Input, Button } from 'antd';
import { css } from '@emotion/react';

const { Option } = Select;

const ConditionStep = ({ step, onSave }) => {
  const [question, setQuestion] = useState(step?.question || '');
  const [operator, setOperator] = useState(step?.operator || '');
  const [value, setValue] = useState(step?.value || '');

  const handleSave = () => {
    if (onSave) {
      onSave({ question, operator, value });
    }
  };

  return (
    <div css={css`margin-bottom: 16px;`}>
      <Select
        placeholder="Pregunta"
        value={question}
        onChange={(val) => setQuestion(val)}
        css={css`width: 30%; margin-right: 8px;`}
      >
        <Option value="Programa">Programa</Option>
        {/* Añadir más opciones según tu base de datos */}
      </Select>
      <Select
        placeholder="Operador"
        value={operator}
        onChange={(val) => setOperator(val)}
        css={css`width: 30%; margin-right: 8px;`}
      >
        <Option value="Igual a">Igual a</Option>
        <Option value="Mayor que">Mayor que</Option>
        {/* Añadir más operadores */}
      </Select>
      <Input
        placeholder="Valor"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        css={css`width: 30%; margin-right: 8px;`}
      />
      <Button onClick={handleSave}>Guardar</Button>
    </div>
  );
};

export default ConditionStep;
