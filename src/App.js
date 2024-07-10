import React, { useState } from 'react';
import MyEnhancedForm from './formik-demo';
import SideMenu from './SideMenu';
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

  return (
    <div className="app">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={handleMenuToggle} 
        onNavigate={handleNavigate} 
      />
      {currentPage === 'page1' ? (
        <div>
          <div className="header-container">
            <button className="menu-btn1" onClick={handleMenuToggle}>
              ☰
            </button>
            <h1>
              Building input primitives with{' '}
              <a href="https://github.com/jaredpalmer/formik">Formik</a>
            </h1>
          </div>
          <p>
            Formik enables you to quickly build and style your own reusable form-related
            components extremely quickly.
          </p>
          <p>
            This example does just that. It demonstrates a custom text input, label, and form
            feedback components as well as a cool shake animation that's triggered if a field is
            invalid.
          </p>
          <MyEnhancedForm user={{ email: '', firstName: '', lastName: '' }} />
        </div>
      ) : (
        <div>
          <h1>Bienvenido a Página 2</h1>
          <p>El formulario está oculto en esta página.</p>
        </div>
      )}
    </div>
  );
};

export default App;
