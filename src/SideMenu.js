/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';

const sideMenuStyle = css`
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background: #111;
  color: white;
  transition: left 0.3s ease;
  padding: 1rem;
  box-shadow: 2px 0 5px rgba(0,0,0,0.5);
  z-index: 2000;
  &.open {
    left: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  margin-bottom: 1rem;
`;

const NavButton = styled.button`
  display: block;
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  color: white;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 0.5rem;

  &:hover {
    background: #575757;
  }
`;

const SideMenu = ({ isOpen, onClose, onNavigate }) => {
  return (
    <div css={sideMenuStyle} className={isOpen ? 'open' : ''}>
      <CloseButton onClick={onClose}>❎</CloseButton>
      <nav>
        <NavButton onClick={() => onNavigate('page1')}>Página 1</NavButton>
        <NavButton onClick={() => onNavigate('page2')}>Página 2</NavButton>
      </nav>
    </div>
  );
};

export default SideMenu;
