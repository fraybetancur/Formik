/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useSwipeable } from 'react-swipeable';
import React from 'react';
import styled from '@emotion/styled';

// Estilos para el contenedor del menú lateral
const SideMenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: ${(props) => (props.isOpen ? '0' : '-100%')};
  width: 80%;
  max-width: 300px;
  height: 100%;
  background: #fff;
  color: #000;
  padding: 1rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: left 0.3s ease;
`;

// Estilos para el botón de cerrar
const CloseButton = styled.button`
  background: none;
  border: none;
  color: #0f0;
  font-size: 1.5rem;
  cursor: pointer;
  margin-bottom: 1rem;
  border-radius: 50%;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #0f0;
    color: #fff;
  }
`;

// Estilos para los botones de navegación
const NavButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  color: #000;
  text-align: left;
  font-size: 1.2rem;
  cursor: pointer;
  margin-bottom: 1rem;
  border-radius: 8px;
  transition: background 0.3s ease, transform 0.3s ease;

  &:hover {
    background: #f5f5f5;
    transform: scale(1.05);
  }

  & > svg {
    margin-right: 1rem;
  }
`;

// Estilos para el overlay
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
`;

// Estilos para el divisor
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin: 1rem 0;
`;

const SideMenu = ({ isOpen, onClose, onNavigate }) => {
  // Manejadores para gestos de swipe
  const handlers = useSwipeable({
    onSwipedLeft: () => onClose(),
    onSwipedRight: () => onClose(),
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left' && isOpen) {
        onClose();
      } else if (eventData.dir === 'Right' && !isOpen) {
        onClose();
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <SideMenuContainer {...handlers} isOpen={isOpen}>
        <CloseButton onClick={onClose}>❎</CloseButton>
        <nav>
          <NavButton onClick={() => onNavigate('MyEnhancedForm')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            My Enhanced Form
          </NavButton>
          <NavButton onClick={() => onNavigate('ExcelUploader')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Excel Uploader
          </NavButton>
          <NavButton onClick={() => onNavigate('SurveyForm')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            SurveyForm
          </NavButton>
          <NavButton onClick={() => onNavigate('DataSync')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Data Sync
          </NavButton>
          <NavButton onClick={() => onNavigate('SimpleForm')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            SimpleForm
          </NavButton>
          <NavButton onClick={() => onNavigate('FormularioDinamico')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Formulario Dinámico
          </NavButton>
          <NavButton onClick={() => onNavigate('ResponsesList')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            ResponsesList
          </NavButton>
          {/* Puedes añadir más NavButtons aquí para otros componentes */}
        </nav>
      </SideMenuContainer>
    </>
  );
};

export default SideMenu;
