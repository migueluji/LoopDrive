// App.js 
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { initGoogleAPI, login, logout } from './googleAPI';
import NavBar from './components/NavBar';
import Wellcome from './pages/Home';
import Games from './pages/Games';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './AppContext';

function App() {
  const { userInfo, setToken, setUserInfo } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const showNavBar = !location.pathname.startsWith('/editor');


  const handleLogout = async () => {
    const token = await logout();
    setToken(token);
    setUserInfo(null);
  };

  const handleLogin = async () => {
    await initGoogleAPI();
    const { token, userInfo } = await login();
    setToken(token);
    setUserInfo(userInfo);
    navigate('/games');
  };

  return (
    <div>
      {showNavBar && <NavBar userInfo={userInfo} handleLogin={handleLogin} handleLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Wellcome />} />
        <Route path="/games" element={<Games />} />
      </Routes>
    </div>
  );
}

export default App;




