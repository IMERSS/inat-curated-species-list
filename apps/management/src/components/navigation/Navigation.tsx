import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Link as RouterLink } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import BackupIcon from '@mui/icons-material/Backup';
import PublishIcon from '@mui/icons-material/Publish';

export const Navigation = () => (
  <Box sx={{ width: '100%', maxWidth: 360 }}>
    <nav aria-label="secondary mailbox folders">
      <List>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/curated-checklist" />}>
            <ListItemText primary="Curated checklist" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/new-additions" />}>
            <ListItemText primary="New additions" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/taxon-changes" />}>
            <ListItemText primary="Taxon changes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/baseline-species" />}>
            <ListItemText primary="Baseline species" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/unconfirmed-species" />}>
            <ListItemText primary="Unconfirmed species" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/accounts" />}>
            <ListItemText primary="Accounts" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Settings
          </ListSubheader>
        }
      >
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/settings/main" />}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Main Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/settings/files" />}>
            <ListItemIcon>
              <BackupIcon />
            </ListItemIcon>
            <ListItemText primary="Files/Backup" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={(props) => <RouterLink {...props} to="/settings/publish" />}>
            <ListItemIcon>
              <PublishIcon />
            </ListItemIcon>
            <ListItemText primary="Publish Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </nav>
  </Box>
);
