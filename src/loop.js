// loop.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { initGoogleAPI, login, logout } from './apis/googleAPI';
import NavBar from './components/NavBar';
import Wellcome from './pages/Home';
import Games from './pages/Games';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './context';
import { folderExists, createFolder, } from './apis/driveAPI';

function Loop() {
  const { setGamesLoaded, setGameList, setAppFolderID, userInfo, expirationTime, setExpirationTime, setToken, setUserInfo } = useAppContext();
  const navigate = useNavigate();

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

  return (
    <div>
      <NavBar userInfo={userInfo} expirationTime={expirationTime} handleLogin={handleLogin} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Wellcome />} />
        <Route path="/games" element={<Games />} />
      </Routes>
    </div>
  );
}

export default Loop;




