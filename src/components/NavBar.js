// NavBar.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Avatar, Box, Tooltip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';

const NavBar = ({ handleLogin, handleLogout }) => {
  const { userInfo, sessionTime } = useAppContext();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    if (sessionTime > 0) {
      setFormattedTime(formatTime(sessionTime));
    } else {
      setFormattedTime('Session has expired');
    }
  }, [sessionTime]);
  

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
                {formattedTime}
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

