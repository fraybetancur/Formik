import React, { useState } from 'react';
import MyEnhancedForm from './formik-demo';
import SideMenu from './SideMenu';
import Header from './Header';
import Footer from './Footer';
import './App.css';

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
    <div className="app">
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
      <main className="main-content">
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
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
