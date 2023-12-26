import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Avatar, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ userInfo, handleLogin, handleLogout }) => {
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

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
    <AppBar position="static">
      <Toolbar>
        <Button onClick={onLogoClick} style={{ padding: 0, marginRight: '16px' }}>
          <img src="/loop.png" alt="Loop Logo" style={{ height: '2rem' }} />
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {userInfo ? (
          <>
            <Button color="inherit" onClick={handleMenuOpen}>
              <Avatar alt={userInfo.name} src={userInfo.picture} />
            </Button>
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
  );
};

export default NavBar;
