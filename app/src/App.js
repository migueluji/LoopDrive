// App.js 
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { initGoogleAPI, login, logout } from './googleAPI';
import NavBar from './components/NavBar';
import Wellcome from './pages/Home';
import Games from './pages/Games';
import Editor from './pages/Editor';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './AppContext'; 

function App() {
  const { userInfo, token, setToken, setUserInfo } = useAppContext();
  const navigate = useNavigate();

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
      />
      <Routes>
        <Route path="/" element={<Wellcome token={token} />} />
        <Route path="/games" element={<Games token={token} />} />
        <Route path="/editor" element={<Editor token={token} />} />
      </Routes>
    </div>
  );
}

export default App;




