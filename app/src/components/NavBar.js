// NavBar.js

import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Avatar, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UserMenu from './UserMenu';

const NavBar = ({ userName, userPicture, onSignOutClick, onSignInClick, navigate, signInButtonVisible, signOutButtonVisible }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const onMyGamesClick = () => {
    navigate('/games');
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
          Loop
        </Typography>
        {signInButtonVisible && (
          <Button variant='outlined' color="inherit" onClick={onSignInClick} startIcon={<AccountCircleIcon />}>
            Login
          </Button>
        )}
        {signOutButtonVisible && (
          <>
            <Button color="inherit" onClick={handleMenuClick}>
              <Avatar alt={userName} src={userPicture} />
            </Button>
            <UserMenu
              userName={userName}
              userPicture={userPicture}
              onMyGamesClick={onMyGamesClick}
              onLogoutClick={onSignOutClick}
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


