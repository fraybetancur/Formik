/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { Modal, Select, Input, Button, Form, Radio } from 'antd';
import { css } from '@emotion/react';

const { Option } = Select;

const modalStyle = css`
  .ant-modal-body {
    display: flex;
    flex-direction: column;
  }
`;

const ConditionEditor = ({ visible, onClose, onSave, questions, choices }) => {
  const [form] = Form.useForm();
  const [conditions, setConditions] = useState([]);
  const [valueType, setValueType] = useState('manual'); // Nuevo estado para tipo de valor
  const [filteredChoices, setFilteredChoices] = useState([]);

  const handleAddClause = () => {
    setConditions([...conditions, { question: '', operator: '==', value: '', valueType: 'manual' }]);
  };

  const handleSave = () => {
    form.validateFields()
      .then(values => {
        onSave(conditions);
        onClose();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;

    if (field === 'question') {
      // Filtrar choices basados en la pregunta seleccionada
      const questionChoices = choices.filter(choice => choice.QuestionID === value);
      newConditions[index]['value'] = ''; // Reiniciar el valor cuando se cambia la pregunta
      setFilteredChoices(questionChoices);
    }

    setConditions(newConditions);
  };

  const handleValueTypeChange = (index, value) => {
    const newConditions = [...conditions];
    newConditions[index]['valueType'] = value;
    newConditions[index]['value'] = ''; // Reiniciar el valor cuando se cambia el tipo de valor
    setConditions(newConditions);
  };

  useEffect(() => {
    // Reiniciar filteredChoices cuando el modal se cierra
    if (!visible) {
      setFilteredChoices([]);
      setConditions([]);
    }
  }, [visible]);

  return (
    <Modal
      css={modalStyle}
      visible={visible}
      title="Agregar Condición"
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Guardar
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {conditions.map((condition, index) => (
          <Form.Item key={index} label={`Condición ${index + 1}`}>
            <Select
              placeholder="Pregunta"
              onChange={(value) => handleConditionChange(index, 'question', value)}
              value={condition.question}
              style={{ width: '30%', marginRight: '1rem' }}
            >
              {questions.map((q) => (
                <Option key={q.QuestionID} value={q.QuestionID}>
                  {q.QuestionText}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Operador"
              onChange={(value) => handleConditionChange(index, 'operator', value)}
              value={condition.operator}
              style={{ width: '20%', marginRight: '1rem' }}
            >
              <Option value="==">es igual a</Option>
              <Option value="!=">no es igual a</Option>
              <Option value=">">es mayor que</Option>
              <Option value="<">es menor que</Option>
            </Select>
            <Radio.Group
              onChange={(e) => handleValueTypeChange(index, e.target.value)}
              value={condition.valueType}
              style={{ marginBottom: '1rem' }}
            >
              <Radio value="manual">Escribir Valor</Radio>
              <Radio value="choices">Seleccionar Choices</Radio>
            </Radio.Group>
            {condition.valueType === 'manual' ? (
              <Input
                placeholder="Valor"
                onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                value={condition.value}
                style={{ width: '30%' }}
              />
            ) : (
              <Select
                placeholder="Seleccionar Choice"
                onChange={(value) => handleConditionChange(index, 'value', value)}
                value={condition.value}
                style={{ width: '30%' }}
              >
                {filteredChoices.map((choice) => (
                  <Option key={choice.OptionID} value={choice.OptionText}>
                    {choice.OptionText}
                  </Option>
                ))}
              </Select>
            )}
            <Button
              type="dashed"
              danger
              onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
              style={{ marginLeft: '1rem' }}
            >
              Eliminar
            </Button>
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="dashed" onClick={handleAddClause} block>
            Agregar Cláusula
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConditionEditor;
