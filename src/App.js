/** @jsxImportSource @emotion/react */
import { Global, css } from '@emotion/react';
import React, { useState, Suspense, lazy } from 'react';
import SideMenu from './SideMenu';
import Header from './Header';
import Footer from './Footer';
import { QuestionProvider } from './QuestionContext';
import DataSyncButton from './DataSyncButton';
import SurveyForm from './Survey';
import ResetDatabase from './ResetDatabase';
import UploadResponsesToCloudant from './UploadToCloudant';

// Lazy load de los componentes
const MyEnhancedForm = lazy(() => import('./formik-demo'));
const SimpleForm = lazy(() => import('./SimpleForm'));
const ExcelUploader = lazy(() => import('./ExcelUploader'));
const DataSync = lazy(() => import('./DataSync'));
const FormularioDinamico = lazy(() => import('./FormularioDinamico'));
const ResponsesList = lazy(() => import('./ResponsesList'));


// Estilos globales para la aplicación
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

// Estilos para el contenedor principal de la aplicación
const appStyles = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 4rem; /* Ajusta este valor según la altura del header */
  padding-bottom: 4rem; /* Ajusta este valor según la altura del footer */
`;

// Estilos para el contenido principal
const mainContentStyles = css`
  flex: 1;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Componente principal de contenido de la aplicación
const AppContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para manejar la visibilidad del menú lateral
  const [currentComponent, setCurrentComponent] = useState('SimpleForm'); // Estado para manejar el componente actual

  // Función para alternar la visibilidad del menú lateral
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para manejar la navegación entre componentes
  const handleNavigate = (component) => {
    setCurrentComponent(component);
    setIsMenuOpen(false); // Cierra el menú al navegar
  };

  // Función para renderizar el componente actual basado en el estado
  const renderComponent = () => {
    switch (currentComponent) {
      case 'MyEnhancedForm':
        return <MyEnhancedForm />;
      case 'ExcelUploader':
        return <ExcelUploader />;
      case 'DataSync':
        return <DataSync />;
      case 'FormularioDinamico':
        return <FormularioDinamico />;
      case 'SimpleForm':
        return <SimpleForm />;
      case 'ResponsesList':
        return <ResponsesList />;
      case 'SurveyForm':
        return <SurveyForm />;
      default:
        return <MyEnhancedForm />;
    }
  };

  return (
    <>
      {/* Aplicación de los estilos globales */}
      <Global styles={globalStyles} />
      <div css={appStyles}>
        {/* Header con funcionalidad para alternar el menú */}
        <Header onMenuToggle={handleMenuToggle} headerText="My Application" />
        {/* Menú lateral con funcionalidad para navegar entre componentes */}
        <SideMenu isOpen={isMenuOpen} onClose={handleMenuToggle} onNavigate={handleNavigate} />
        {/* Botón de sincronización */}
        <DataSyncButton />
        <ResetDatabase/>
        <UploadResponsesToCloudant/>
        {/* Contenido principal que cambia según el componente seleccionado */}
        <main css={mainContentStyles}>
          <Suspense fallback={<div>Cargando...</div>}>
            {renderComponent()}
          </Suspense>
        </main>
        {/* Footer de la aplicación */}
        <Footer />
      </div>
    </>
  );
};

// Componente principal de la aplicación que envuelve todo en el QuestionProvider
const App = () => (
  <QuestionProvider>
    <AppContent />
  </QuestionProvider>
);

export default App;
