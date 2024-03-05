// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { getUserInfo, initGoogleAPI, login, logout } from './apis/googleAPI';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Games from './pages/Games';
import Edit from './pages/Edit';
import Play from './pages/Play';
import SessionDialog from './components/SessionDialog';
import { useAppContext } from './AppContext';
import { folderExists, createFolder } from './apis/driveAPI';

function App() {
  const { token, setToken, setUserInfo, setAppFolderID, setGameList, sessionTime, setSessionTime, CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES } = useAppContext();
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
    // newToken.expires_in = 30;
    setSessionTime(newToken.expires_in);
    let newAppFolderID = await folderExists("Loop Games", newToken.access_token);
    if (!newAppFolderID) {
      newAppFolderID = await createFolder("Loop Games", 'root', newToken.access_token);
    }
    setAppFolderID(newAppFolderID);
    const newUserInfo = await getUserInfo(newToken.access_token);
    setUserInfo(newUserInfo);
    if (location.pathname === '/') navigate('/games');
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUserInfo(null);
    setAppFolderID(null);
    setGameList(null);
    setGameList([]);
    setSessionTime(null);
    setIsSessionTimeOver(false);
    navigate('/');
  };

  return (
    <div style={{ height: '0px' }}>
      {!isEditorPage && <NavBar handleLogin={handleLogin} handleLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Home />} />
        {isAuthenticated ? (
          <>
            <Route path="/games" element={<Games />} />
            <Route path="/edit" element={<Edit />} />
            <Route path="/play" element={<Play />} />
          </>
        ) : (
          <Route path="*" element={<Navigate replace to="/" />} />
        )}
      </Routes>
      {isSessionTimeOver && <SessionDialog open={isSessionTimeOver} onLogin={handleLogin} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
