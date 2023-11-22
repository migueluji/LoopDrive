// UserMenu.js
import React from 'react';
import { Menu, MenuItem, Avatar, Typography, Divider, ListItemIcon } from '@mui/material';
import GamesIcon from '@mui/icons-material/SportsEsports';
import LogoutIcon from '@mui/icons-material/Logout';

const UserMenu = ({ userName, userPicture, onMyGamesClick, onLogoutClick, anchorEl, onClose }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Avatar alt={userName} src={userPicture} sx={{ margin: 'auto', width: 60, height: 60 }} />
        <Typography variant="body1" sx={{ marginTop: 1 }}>{userName}</Typography>
      </div>
      <Divider />
      <MenuItem onClick={onMyGamesClick}>
        <ListItemIcon>
          <GamesIcon />
        </ListItemIcon>
        My Games
      </MenuItem>
      <MenuItem onClick={onLogoutClick}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;

