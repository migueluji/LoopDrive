import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { initGoogleAPI, signOut, signIn } from './googleAPI';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Games from './pages/Games';

function App() {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPicture, setUserPicture] = useState(null);
  const [signInButtonVisible, setSignInButtonVisible] = useState(true);
  const [signOutButtonVisible, setSignOutButtonVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSignInButtonVisible(!token || !token.access_token);
    setSignOutButtonVisible(!!token && !!token.access_token);
  }, [token]);

  const handleSignOutClick = async () => {
    const newToken = await signOut();
    setToken(newToken);
    navigate('/home');
  };

  const handleSignInClick = async () => {
    try {
      await initGoogleAPI();
      const { token, userInfo } = await signIn();
      setToken(token);
      setUserName(userInfo.name);
      setUserPicture(userInfo.picture);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };


  return (
    <div>
      <NavBar
        userName={userName}
        userPicture={userPicture}
        onSignOutClick={handleSignOutClick}
        onSignInClick={handleSignInClick}
        signInButtonVisible={signInButtonVisible}
        signOutButtonVisible={signOutButtonVisible}
        navigate={navigate}
      />

      <Routes>
        <Route path="/home" element={<Home token={token} />} />
        <Route path="/games" element={<Games token={token} />} />
      </Routes>
    </div>
  );
}

export default App;


