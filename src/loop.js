// loop.js
import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { initGoogleAPI, login, logout } from './apis/googleAPI';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Games from './pages/Games';
import Editor from './pages/Editor';
import Play from './pages/Play';
import { useAppContext } from './context';
import { folderExists, createFolder } from './apis/driveAPI';


function Loop() {
  const { setGamesLoaded, setAppFolderID, userInfo, expirationTime, setExpirationTime, setToken, setUserInfo } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const token = await logout();
    setToken(token);
    setUserInfo(null);
  };

  const handleLogin = async () => {
    await initGoogleAPI();
    const { token, userInfo } = await login();
    // Calculate the exact moment in the future when the token will expire, in milliseconds
    const expirationTime = new Date().getTime() + token.expires_in * 1000;
    // Verificar y crear el directorio de juegos
    var appFolderID = await folderExists("Loop Games", token.access_token);
    if (!appFolderID) {
      appFolderID = await createFolder("Loop Games", 'root', token.access_token);
      setAppFolderID(appFolderID);
    } else {
      setAppFolderID(appFolderID);
    }
    setGamesLoaded(false); // Establece gameList en un array vacío
    setToken(token);
    setExpirationTime(expirationTime); // Store the expiration time
    setUserInfo(userInfo);
    navigate('/games');
  };

  // Verifica si estás en la página del editor para no mostrar la barra global
  const isEditorPage = location.pathname.includes('/editor');

  return (
    <div style={{ height: '0px' }}>
      {!isEditorPage && (
        // Renderiza la barra global en todas las páginas excepto en la del editor
        <NavBar userInfo={userInfo} expirationTime={expirationTime} handleLogin={handleLogin} handleLogout={handleLogout} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/play" element={<Play />} />
      </Routes>
    </div>
  );
}

export default Loop;





