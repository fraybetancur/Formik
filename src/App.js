/** @jsxImportSource @emotion/react */
import { Global, css } from '@emotion/react';
import React, { useState } from 'react';
import MyEnhancedForm from './formik-demo';
import SideMenu from './SideMenu';
import Header from './Header';
import Footer from './Footer';
import ExcelUploader from './ExcelUploader';
import SurveyApp from './SurveyApp';

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

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('page1');

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
          {currentPage === 'page1' ? (
            <div>
              <h3>
                Building input primitives with{' '}
                <a href="https://github.com/jaredpalmer/formik">Formik</a>
              </h3>
              <p>
                Formik enables you to quickly build and style your own reusable form-related
                components extremely quickly.
              </p>
              <MyEnhancedForm user={{ email: '', firstName: '', lastName: '' }} />
            </div>
          ) : (
            <div>
              <h1>Bienvenido a Página 2</h1>
              <p>El formulario está oculto en esta página.</p>
              <SurveyApp></SurveyApp>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};



export default App;
