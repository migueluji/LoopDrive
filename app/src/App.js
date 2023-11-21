import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Router } from 'react-router-dom';
import { initGoogleAPI, signOut, signIn } from './googleAPI';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Home from './pages/Home';
import Games from './pages/Games';

function App() {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [signInButtonVisible, setSignInButtonVisible] = useState(true);
  const [signOutButtonVisible, setSignOutButtonVisible] = useState(false);
  const navigate = useNavigate(); // Agrega esta línea

  useEffect(() => {
    setSignInButtonVisible(!token || !token.access_token);
    setSignOutButtonVisible(!!token && !!token.access_token);
  }, [token]);

  const handleSignOutClick = async () => {
    const newToken = await signOut()
    setToken(newToken);
    navigate('/home');
  };

  const handleSignInClick = async () => {
    await initGoogleAPI();
    const { token, userInfo } = await signIn();
    console.log(userInfo.name, token);
    setToken(token);
    setUserName(userInfo.name);
    navigate('/games');
  };

  return (

    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Loop
          </Typography>
          {signInButtonVisible && <Button color="inherit" onClick={handleSignInClick}>Login</Button>}
          {signOutButtonVisible && (
            <>
              <Typography variant="h6" sx={{ marginRight: '10px' }}>
                {userName}
              </Typography>
              <Button color="inherit" onClick={handleSignOutClick}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/home" element={<Home token={token} />} />
        <Route path="/games" element={<Games token={token} />} />
      </Routes>
    </div>

  );
}

export default App;

