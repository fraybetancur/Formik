/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const headerStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.1rem;
  background-color: #08c;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2rem;
  color: white;
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  color: white;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2rem;
  color: white;
`;

const buttonStyle = css`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: none;
  color: white;
  margin: 0 0;
  &:focus {
    outline: none;
  }
`;

const Header = ({ onMenuToggle, onRightButtonClick, headerText }) => {
  return (
    <header css={headerStyle}>
      <Left>
        <button css={buttonStyle} onClick={onMenuToggle}>
          ☰
        </button>
      </Left>
      <Center>
        <h1>{headerText}</h1>
      </Center>
      <Right>
        <button css={buttonStyle} onClick={onRightButtonClick}>
          ⚙️
        </button>
      </Right>
    </header>
  );
};

export default Header;
