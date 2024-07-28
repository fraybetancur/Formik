/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Modal, Card } from 'antd';
import ConditionStep from './ConditionStep';
import ConditionPreview from './ConditionPreview';
import PouchDB from 'pouchdb';
import { css } from '@emotion/react';

const db = new PouchDB('conditions');

const ConditionBuilder = () => {
  const [steps, setSteps] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchConditions = async () => {
      const result = await db.allDocs({ include_docs: true });
      setSteps(result.rows.map(row => row.doc));
    };
    fetchConditions();
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSteps(items);
  };

  const addCondition = () => {
    setIsModalVisible(true);
  };

  const saveCondition = async (condition) => {
    const response = await db.post(condition);
    condition._id = response.id;
    setSteps([...steps, condition]);
    setIsModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={addCondition}>Añadir Condición</Button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable-1">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              css={css`
                padding: 16px;
                background: #f8f8f8;
                border: 2px dashed #ddd;
                border-radius: 4px;
                margin-top: 16px;
                min-height: 200px;
              `}
            >
              {steps.map((step, index) => (
                <Draggable key={step._id} draggableId={step._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      css={css`
                        padding: 16px;
                        background: #fff;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        margin-bottom: 16px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                      `}
                    >
                      <Card>
                        <ConditionStep step={step} />
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ConditionPreview conditions={steps} />
      <Modal title="Añadir Condición" visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)}>
        <ConditionStep onSave={saveCondition} />
      </Modal>
    </div>
  );
};

export default ConditionBuilder;
