// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { initGoogleAPI, login, logout } from './googleAPI';
import NavBar from './components/NavBar';
import Wellcome from './pages/Home';
import Games from './pages/Games';

function App() {
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   console.log("app se renderiza");
  // }, []);

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
      <NavBar
        userInfo={userInfo}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        navigate={navigate}
      />
      <Routes>
        <Route path="/" element={<Wellcome token={token} />} />
        <Route path="/games" element={<Games token={token} />} />
      </Routes>
    </div>
  );
}

export default App;


