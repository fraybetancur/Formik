// pages.js
import React from 'react';
import MyEnhancedForm from './formik-demo';
import ExcelUploader from './ExcelUploader';
import DataSync from './DataSync';
import QuestionLoader from './QuestionLoader';
import SurveyForm from './SurveyForm';
import FormularioDinamico from './Form';

export const Page1 = ({ currentQuestion }) => <MyEnhancedForm user={{ email: '', firstName: '', lastName: '' }} />;
export const Page2 = () => <ExcelUploader />;
export const Page3 = () => <DataSync />;
export const Page4 = ({ questions, isLoading, isSyncing, syncData }) => (
  <>
    <QuestionLoader syncData={syncData} />
    <SurveyForm questions={questions} isLoading={isLoading} isSyncing={isSyncing} />
  </>
);
export const Page5 = () => <div><h1>Contenido de la Página 5</h1></div>;
export const Page6 = ({ currentQuestion }) => <FormularioDinamico currentQuestion={currentQuestion}currentQuestion={currentQuestion} 
handleNext={handleNext} 
handleBack={handleBack}
isNextDisabled={isNextDisabled}
isBackDisabled={isBackDisabled} />;
export const Page7 = () => <div><h1>Contenido de la Página 7</h1></div>;
export const Page8 = () => <div><h1>Contenido de la Página 8</h1></div>;
export const Page9 = () => <div><h1>Contenido de la Página 9</h1></div>;
export const Page10 = () => <div><h1>Contenido de la Página 10</h1></div>;
export const Page11 = () => <div><h1>Contenido de la Página 11</h1></div>;
export const Page12 = () => <div><h1>Contenido de la Página 12</h1></div>;
export const Page13 = () => <div><h1>Contenido de la Página 13</h1></div>;
export const Page14 = () => <div><h1>Contenido de la Página 14</h1></div>;
export const Page15 = () => <div><h1>Contenido de la Página 15</h1></div>;
