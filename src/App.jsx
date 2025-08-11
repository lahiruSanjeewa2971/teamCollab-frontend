import {Provider} from 'react-redux'
import {store} from './redux/store'
import AppRouter from './router/AppRouter'
import { ToastContainer } from 'react-toastify'
import { useEffect } from 'react'
import tokenExpirationService from './services/tokenExpirationService'
import { ThemeProvider } from './contexts/ThemeContext'

function AppContent() {
  useEffect(() => {
    // Start token expiration service when app mounts
    tokenExpirationService.start();
    
    // Cleanup when app unmounts
    return () => {
      tokenExpirationService.stop();
    };
  }, []);

  return (
    <>
      <AppRouter/>
      <ToastContainer position='top-right' />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  )
}

export default App
