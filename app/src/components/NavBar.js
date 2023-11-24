// NavBar.js

import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Avatar, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import UserMenu from './UserMenu';
var loginButtonVisible = true;


const NavBar = ({ userInfo, handleLogin, handleLogout, navigate }) => {

  if (userInfo) loginButtonVisible = false;

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
    loginButtonVisible = true;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <AllInclusiveIcon sx={{ fontSize: "3.125rem", marginRight: '16px' }} />
        <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Loop
        </Typography>
        {loginButtonVisible && (
          <Button variant='outlined' color="inherit" onClick={handleLogin} startIcon={<AccountCircleIcon />}>
            Login
          </Button>
        )}
        {!loginButtonVisible && (
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
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;


