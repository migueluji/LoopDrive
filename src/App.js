// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { getUserInfo, initGoogleAPI, login, logout } from './apis/googleAPI';
import { folderExists, createFolder } from './apis/driveAPI';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import Games from './pages/Games';
import Edit from './pages/Edit';
import Play from './pages/Play';
import Legal from './pages/Legal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Footer from './components/Footer';
import SessionDialog from './components/SessionDialog';
import { useAppContext } from './AppContext';

function App() {
  const { token, setToken, setUserInfo, setAppFolderID, setGameList, setUpdateGameList, sessionTime, setSessionTime, CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditorPage = location.pathname.includes('/edit');
  const [isSessionTimeOver, setIsSessionTimeOver] = useState(false);
  const isAuthenticated = token !== null;

  useEffect(() => {
    let interval;
    if (sessionTime > 0) {
      interval = setInterval(() => {
        setSessionTime((currentTime) => currentTime - 1);
      }, 1000);
    } else if (sessionTime === 0) {
      setIsSessionTimeOver(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [sessionTime, setSessionTime]);

  const handleLogin = async () => {
    setIsSessionTimeOver(false);
    await initGoogleAPI(CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES);
    const newToken = await login();
    setToken(newToken);
    //newToken.expires_in = 30;
    setSessionTime(newToken.expires_in);
    let newAppFolderID = await folderExists("Loop Games", newToken.access_token);
    if (!newAppFolderID) {
      newAppFolderID = await createFolder("Loop Games", 'root', newToken.access_token);
    }
    setAppFolderID(newAppFolderID);
    const newUserInfo = await getUserInfo(newToken.access_token);
    setUserInfo(newUserInfo);
    setUpdateGameList(true);
    if (location.pathname === '/') navigate('/games');
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUserInfo(null);
    setAppFolderID(null);
    setGameList([]);
    setSessionTime(null);
    setIsSessionTimeOver(false);
    navigate('/');
  };

  return (
    // Ajusta el contenedor principal aquí
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isEditorPage && <NavBar handleLogin={handleLogin} handleLogout={handleLogout} />}
      {/* Envuelve tus rutas en un div que pueda expandirse para empujar el Footer hacia abajo */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage handleLogin={handleLogin} />} />
          {isAuthenticated && (
            <>
              <Route path="/games" element={<Games />} />
              <Route path="/edit" element={<Edit />} />
              <Route path="/play" element={<Play />} />
            </>
          )}
          {/* Estas rutas deben ser accesibles sin importar el estado de autenticación */}
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {!isAuthenticated && <Route path="*" element={<Navigate replace to="/" />} />}
        </Routes>
      </div>
      {isSessionTimeOver && <SessionDialog open={isSessionTimeOver} onLogin={handleLogin} onLogout={handleLogout} />}
      {!isEditorPage && <Footer />}
    </div>
  );
}

export default App;
