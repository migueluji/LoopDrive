import React from 'react';
import { Menu, MenuItem, Avatar, Typography, Divider, ListItemIcon } from '@mui/material';
import GamesIcon from '@mui/icons-material/SportsEsports';
import LogoutIcon from '@mui/icons-material/Logout';

const UserMenu = ({ userInfo, onMyGamesClick, onLogoutClick, anchorEl, onClose }) => {
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
          <MenuItem onClick={onLogoutClick}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      ) : null}
    </>
  );
};

export default UserMenu;

