import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { getUserInfo, initGoogleAPI, login, logout } from './apis/googleAPI';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Games from './pages/Games';
import Editor from './pages/Editor';
import Play from './pages/Play';
import SessionDialog from './components/SessionDialog';
import { useAppContext } from './context';
import { folderExists, createFolder } from './apis/driveAPI';

function Loop() {
  const { setToken, setUserInfo,setSessionTime, setAppFolderID, CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES} = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   const checkSessionExpiration = () => {
  //     const currentTime = new Date().getTime();
  //     if (expirationTime) {
  //       const timeUntilExpiration = expirationTime - currentTime;
  //       const fiveMinutesInMilliseconds = 59.5 * 60 * 1000;
  //       if (userInfo && timeUntilExpiration <= fiveMinutesInMilliseconds && timeUntilExpiration > 0) {
  //         setIsDialogOpen(true);
  //         setLastLocation(location.pathname);
  //       }
  //     }
  //   };

  //   checkSessionExpiration();
  //   const checkInterval = setInterval(checkSessionExpiration, 1000);
  //   return () => clearInterval(checkInterval);
  // }, [expirationTime, setIsDialogOpen, userInfo, location.pathname]);

  // useEffect(() => {
  //   if (location.pathname.includes('/editor')) {
  //     const iframe = document.getElementById('gameIframe');
  //     if (iframe) {
  //       console.log("game saved!!!");
  //       iframe.contentWindow.postMessage('GuardarJuego', '*');
  //     }
  //   }
  // }, [location.pathname]);

  const handleLogin = async () => {
    await initGoogleAPI(CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES);
    const newToken = await login();
    setToken(newToken);
    const newExpirationTime = new Date().getTime() + newToken.expires_in * 1000;
    console.log(newExpirationTime, newToken.expires_in, newToken);
    setSessionTime(newExpirationTime);
    var newAppFolderID = await folderExists("Loop Games", newToken.access_token);
    if (!newAppFolderID) {
      newAppFolderID = await createFolder("Loop Games", 'root', newToken.access_token);
    }
    setAppFolderID(newAppFolderID);
    const newUserInfo = await getUserInfo(newToken.access_token);
    setUserInfo(newUserInfo);
    navigate('/games');
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUserInfo(null);
    setSessionTime(null);
    setAppFolderID(null);
  };

  const isEditorPage = location.pathname.includes('/editor');

  return (
    <div style={{ height: '0px' }}>
      {!isEditorPage && (
        <NavBar handleLogin={handleLogin} handleLogout={handleLogout} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/play" element={<Play />} />
      </Routes>
      <SessionDialog onLogin={handleLogin} onLogout={handleLogout} />
    </div>
  );
}

export default Loop;
