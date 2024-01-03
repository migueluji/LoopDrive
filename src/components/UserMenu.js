// UserMenu.js
import React from 'react';
import { Menu, MenuItem, Avatar, Typography, Divider, ListItemIcon, Button } from '@mui/material';
import GamesIcon from '@mui/icons-material/SportsEsports';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const UserMenu = ({ userInfo, onMyGamesClick, onLogoutClick, onLoginClick, anchorEl, onClose }) => {
  return (
    <>
      {userInfo ? (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onClose}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Avatar alt={userInfo.name} src={userInfo.picture} sx={{ margin: 'auto', width: 124, height: 124 }} />
            <Typography variant="body1" sx={{ marginTop: 1, fontWeight: 'bold' }}>{userInfo.name}</Typography>
          </div>
          <Divider />
          <MenuItem onClick={onMyGamesClick}>
            <ListItemIcon>
              <GamesIcon />
            </ListItemIcon>
            My Games
          </MenuItem>
          <MenuItem onClick={onLoginClick}> {/* Cambia el orden aquí */}
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            Login Again
          </MenuItem>
          <MenuItem onClick={onLogoutClick}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      ) : (
        <Button variant='outlined' color="inherit" onClick={onLoginClick} startIcon={<AccountCircleIcon />}>
          Login
        </Button>
      )}
    </>
  );
};

export default UserMenu;
