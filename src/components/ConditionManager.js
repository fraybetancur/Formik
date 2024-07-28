/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { Button, List, Typography } from 'antd';
import PouchDB from 'pouchdb-browser';
import ConditionEditor from './ConditionEditor';
import ConditionPreview from './ConditionPreview';
import { QuestionContext } from './QuestionContext';
import ConditionCard from './ConditionCard';

const localSurveyDB = new PouchDB('survey');
const localChoicesDB = new PouchDB('choices');

const ConditionManager = () => {
  const [isConditionEditorVisible, setIsConditionEditorVisible] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const { filters, setFilters } = useContext(QuestionContext);

  useEffect(() => {
    const loadQuestionsAndChoices = async () => {
      try {
        const surveyResult = await localSurveyDB.allDocs({ include_docs: true });
        setQuestions(surveyResult.rows.map(row => row.doc));
        const choicesResult = await localChoicesDB.allDocs({ include_docs: true });
        setChoices(choicesResult.rows.map(row => row.doc));
      } catch (err) {
        console.error('Error loading questions and choices:', err);
      }
    };

    loadQuestionsAndChoices();
  }, []);

  const handleSaveConditions = (newConditions) => {
    setConditions(newConditions);
    setIsConditionEditorVisible(false);
  };

  const handleAddCondition = (question) => {
    setIsConditionEditorVisible(true);
  };

  return (
    <div>
      <Button onClick={() => setIsConditionEditorVisible(true)}>Editar Condiciones</Button>
      <ConditionEditor
        visible={isConditionEditorVisible}
        onClose={() => setIsConditionEditorVisible(false)}
        onSave={handleSaveConditions}
        questions={questions}
        choices={choices}
      />
      <div>
        <Typography.Title level={3}>Condiciones Actuales:</Typography.Title>
        <ConditionPreview conditions={conditions} />
      </div>
      <div>
        {questions.map((question) => (
          <ConditionCard key={question.QuestionID} question={question} onAddCondition={handleAddCondition} />
        ))}
      </div>
    </div>
  );
};

export default ConditionManager;
