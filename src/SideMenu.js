/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useSwipeable } from 'react-swipeable';
import React, { useState } from 'react';
import styled from '@emotion/styled';

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

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin: 1rem 0;
`;

const SideMenu = ({ isOpen, onClose, onNavigate }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => onClose(),
    onSwipedRight: () => onClose(),
    onSwiping: (eventData) => {
      if (eventData.dir === "Left" && isOpen) {
        onClose();
      } else if (eventData.dir === "Right" && !isOpen) {
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
          <NavButton onClick={() => onNavigate('page1')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Página 1
          </NavButton>
          <NavButton onClick={() => onNavigate('page2')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Página 2
          </NavButton>
          <Divider />
          <NavButton onClick={() => onNavigate('configurations')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Configuraciones
          </NavButton>
          <NavButton onClick={() => onNavigate('help')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Ayuda y Servicio
          </NavButton>
        </nav>
      </SideMenuContainer>
    </>
  );
};

export default SideMenu;
