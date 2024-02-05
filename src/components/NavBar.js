// NavBar.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Avatar, Box, Tooltip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';

const NavBar = ({ handleLogin, handleLogout }) => {
  const { userInfo, expirationTime } = useAppContext();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const difference = expirationTime - currentTime;
      const minutes = Math.floor(difference / 60000);
      const seconds = Math.floor((difference % 60000) / 1000);
      if (difference > 0) {
        setRemainingTime(`${minutes} : ${seconds < 10 ? '0' : ''}${seconds}`);
      } else {
        setRemainingTime('Session has expired');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationTime]);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const onMyGamesClick = () => {
    navigate('/games');
    handleMenuClose();
  };

  const onLogoutClick = () => {
    handleLogout();
    navigate('/');
    handleMenuClose();
  };

  const onLogoClick = () => {
    navigate('/');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Button onClick={onLogoClick} style={{ padding: 0, marginRight: '16px' }}>
            <img src="/loop.png" alt="Loop Logo" style={{ height: '2rem' }} />
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {userInfo ? (
            <>
              {/* Texto del tiempo restante */}
              <span style={{ marginRight: '10px', color: 'white', alignSelf: 'center', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
                {remainingTime}
              </span>
              {/* Tooltip y Avatar */}
              <Tooltip title={userInfo.name}>
                <Button color="inherit" onClick={handleMenuOpen}>
                  <Avatar
                    alt={userInfo.name}
                    src={userInfo.picture}
                  />
                </Button>
              </Tooltip>
              <UserMenu
                userInfo={userInfo}
                onMyGamesClick={onMyGamesClick}
                onLogoutClick={onLogoutClick}
                anchorEl={menuAnchorEl}
                onClose={handleMenuClose}
              />
            </>
          ) : (
            <Button variant='outlined' color="inherit" onClick={handleLogin} startIcon={<AccountCircleIcon />}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;

