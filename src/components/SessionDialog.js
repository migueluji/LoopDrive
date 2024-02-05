// SessionDialog.js
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const SessionDialog = ({ isOpen, onLogin, onLogout }) => (
  <Dialog open={isOpen} onClose={onLogout}>
    <DialogTitle>Session Expired</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Your session has expired. Would you like to log in again or log out?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onLogin}>Login</Button>
      <Button onClick={onLogout}>Logout</Button>
    </DialogActions>
  </Dialog>
);

export default SessionDialog;