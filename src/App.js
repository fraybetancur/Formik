/** @jsxImportSource @emotion/react */
import { Global, css } from '@emotion/react';
import React, { useState, useEffect, Suspense, lazy, useContext } from 'react';
import SideMenu from './components/SideMenu';
import Header from './components/Header';
import Footer from './components/Footer';
import { QuestionProvider, QuestionContext } from './components/QuestionContext';
import SurveyForm from './components/Survey';
import SubHeader from './components/SubHeader';
import Formulario from './components/Formulario';
import ParticipantList from './components/ParticipantList';
import { ParticipantDetails } from './components/ParticipantDetails';
import PDFUploader from './components/PDFUploader';
import LoginForm from './components/LoginForm';
import CacheDownloader from './components/CacheDownloader';
import ConditionManager from './components/ConditionManager';
import ConditionEditor from './components/ConditionEditor';

const MyEnhancedForm = lazy(() => import('./components/formik-demo'));
const ExcelUploader = lazy(() => import('./components/ExcelUploader'));
const DataSync = lazy(() => import('./components/old/DataSync'));
const ResponsesList = lazy(() => import('./components/ResponsesList'));

const globalStyles = css`
  * {
    box-sizing: border-box;
  }

  html, body {
    overscroll-behavior: contain;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 14px;
    line-height: 1.5;
    color: #24292e;
    background-color: #fff;
    margin: 0;
    padding: 0;
  }

  a {
    color: #08c;
  }
`;

const appStyles = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 4rem;
  padding-bottom: 4rem;
`;

const mainContentStyles = css`
  flex: 1;
  padding: 0rem;

  @media (max-width: 768px) {
    padding: 0rem;
  }
`;

const AppContent = ({ isLoggedIn, onLogin }) => { // * Recibir isLoggedIn y onLogin como props.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubHeaderVisible, setIsSubHeaderVisible] = useState(false);
  const { currentComponent, setCurrentComponent, setCurrentQuestionIndex, setFilters } = useContext(QuestionContext);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSubHeaderToggle = () => {
    if (isSubHeaderVisible) {
      setIsSubHeaderVisible(false);
    } else {
      setIsSubHeaderVisible(true);
      setTimeout(() => {
        setIsSubHeaderVisible(false);
      }, 5000);
    }
  };

  const handleReloadClick = () => {
    window.location.reload();
  };

  const handleNavigate = (component, participantId = null) => {
    console.log('handleNavigate called with component:', component, 'and participantId:', participantId); // Log para depuración
    if (component === 'Formulario') {
      setCurrentQuestionIndex(0);
    }
    setCurrentComponent({ component, participantId });
    setIsMenuOpen(false);
  };

  const handleBack = () => {
    console.log('handleBack called'); // Log para depuración
    setCurrentComponent({ component: 'ParticipantList' });
  };

  const renderComponent = () => {
    if (!isLoggedIn) { // * Mostrar LoginForm si el usuario no está autenticado.
      return <LoginForm onLogin={onLogin} />;
    }
    switch (currentComponent.component) {
      case 'MyEnhancedForm':
        return <MyEnhancedForm />;
      case 'ExcelUploader':
        return <ExcelUploader />;
      case 'CacheDownloader':
        return <CacheDownloader onNavigate={handleNavigate} />;
      case 'DataSync':
        return <DataSync />;
      case 'ResponsesList':
        return <ResponsesList />;
      case 'ConditionManager':
        return <ConditionManager />;
      case 'ConditionEditor':
        return <ConditionEditor />;
      case 'SurveyForm':
        return <SurveyForm onNavigate={handleNavigate} participantId={currentComponent.participantId} />;
      case 'Formulario':
        return <Formulario onNavigate={handleNavigate} participantId={currentComponent.participantId} />;
      case 'ParticipantList':
        return <ParticipantList onNavigate={handleNavigate} />;
      case 'ParticipantDetails':
        console.log('Rendering ParticipantDetails with onNavigate:', typeof handleNavigate); // Log para depuración
        return <ParticipantDetails participantId={currentComponent.participantId} onBack={handleBack} onNavigate={handleNavigate} />;
      case 'PDFUploader':
        return <PDFUploader onNavigate={handleNavigate} />;
      default:
        return <ParticipantList onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Global styles={globalStyles} />
      <div css={appStyles}>
        <Header 
          onMenuToggle={handleMenuToggle} 
          onRightButtonClick={handleSubHeaderToggle} 
          headerText="DM SURVEYS" 
        />
        {isSubHeaderVisible && <SubHeader onReloadClick={handleReloadClick} />}
        <SideMenu isOpen={isMenuOpen} onClose={handleMenuToggle} onNavigate={handleNavigate} />
        <main css={mainContentStyles}>
          <Suspense fallback={<div>Cargando...</div>}>
            {renderComponent()}
          </Suspense>
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // * Definir el estado de autenticación en el nivel superior.

  const handleLogin = (organizationId, programId, userType) => { // * Definir la función handleLogin para manejar la autenticación.
    setIsLoggedIn(true);
    console.log(`Logged in with Organization: ${organizationId}, Program: ${programId}, User Type: ${userType}`);
  };

  return (
    <QuestionProvider>
      <AppContent isLoggedIn={isLoggedIn} onLogin={handleLogin} /> {/* * Pasar isLoggedIn y handleLogin como props a AppContent */}
    </QuestionProvider>
  );
};

export default App;
