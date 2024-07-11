/** @jsxImportSource @emotion/react */
import { Global, css } from '@emotion/react';
import React, { useState, useContext, useCallback } from 'react';
import SideMenu from './SideMenu';
import Header from './Header';
import Footer from './Footer';
import { QuestionProvider, QuestionContext } from './QuestionContext';
import {
  Page1, Page2, Page3, Page4, Page5,
  Page6, Page7, Page8, Page9, Page10,
  Page11, Page12, Page13, Page14, Page15
} from './pages';

const globalStyles = css`
  * {
    box-sizing: border-box;
  }

  body {
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
  padding-top: 4rem; /* Ajusta este valor según la altura del header */
  padding-bottom: 4rem; /* Ajusta este valor según la altura del footer */
`;

const mainContentStyles = css`
  flex: 1;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const AppContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('page1'); // Página por defecto
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { questions, isLoading, isSyncing, syncData } = useContext(QuestionContext);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handleRightButtonClick = () => {
    alert('Right button clicked!');
  };

  const getHeaderText = () => {
    return 'My Application';
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

  const renderPage = () => {
    switch (currentPage) {
      case 'page1':
        return <Page1 currentQuestion={currentQuestion} />;
      case 'page2':
        return <Page2 />;
      case 'page3':
        return <Page3 />;
      case 'page4':
        return <Page4 
                 questions={questions} 
                 isLoading={isLoading} 
                 isSyncing={isSyncing} 
                 syncData={syncData} 
               />;
      case 'page5':
        return <Page5 />;
      case 'page6':
        return (
          <Page6 
            currentQuestion={currentQuestion} 
            handleNext={handleNext} 
            handleBack={handleBack} 
            isNextDisabled={currentQuestionIndex >= questions.length - 1}
            isBackDisabled={currentQuestionIndex === 0}
          />
        );
      case 'page7':
        return <Page7 />;
      case 'page8':
        return <Page8 />;
      case 'page9':
        return <Page9 />;
      case 'page10':
        return <Page10 />;
      case 'page11':
        return <Page11 />;
      case 'page12':
        return <Page12 />;
      case 'page13':
        return <Page13 />;
      case 'page14':
        return <Page14 />;
      case 'page15':
        return <Page15 />;
      default:
        return <Page1 />;
    }
  };

  return (
    <>
      <Global styles={globalStyles} />
      <div css={appStyles}>
        <Header 
          onMenuToggle={handleMenuToggle} 
          onRightButtonClick={handleRightButtonClick} 
          headerText={getHeaderText()} 
        />
        <SideMenu 
          isOpen={isMenuOpen} 
          onClose={handleMenuToggle} 
          onNavigate={handleNavigate} 
        />
        <main css={mainContentStyles}>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </>
  );
};

const App = () => (
  <QuestionProvider>
    <AppContent />
  </QuestionProvider>
);

export default App;
