import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';

export const Header = () => (
  <AppBar position="static" elevation={0}>
    <Toolbar>
      <Typography variant="h6" sx={{ my: 2 }}>
        Curated Checklist
      </Typography>{' '}
      <Divider />
      <Box sx={{ flexGrow: 1 }} />
      <List>
        <ListItem key="" disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText sx={{ my: 0 }} primary="Update Checklist Data from iNat" />
          </ListItemButton>
        </ListItem>
      </List>
      <IconButton size="large" color="inherit">
        <AccountCircle />
      </IconButton>
      <IconButton size="large" aria-label="show 4 new mails" color="inherit">
        <Logout />
      </IconButton>
    </Toolbar>
  </AppBar>
);
