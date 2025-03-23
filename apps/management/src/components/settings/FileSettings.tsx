import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';

export const FileSettings = () => {
  const [backupFolder, setBackupFolder] = useState('');

  return (
    <>
      <h2>File/Backup Settings</h2>

      <p>
        This application uses a "flatfile" database, meaning the <b>configuration settings</b>,{' '}
        <b>curated species data</b>, <b>baseline data</b> and more are stored in files on the server running this
        application. That location is then backed up in git (a code repository), at a location of your choice.{' '}
        <i>This provides a paper trail of every change that occurs and wards against data loss</i>. The data is stores
        is public in nature: no passwords or anything sensitive beyond the iNat usernames of the curators and people on
        the New Additions list.
      </p>

      {/* <Alert severity="info">
        In this application, you can click "save" on any page to regenerate content on the server, but in order to
        publish a new checklist you'll need to first sync the data with the git repository. That'll prevent against data
        loss.
      </Alert> */}

      <form>
        <Grid container spacing={2}>
          <Grid size={3}>Backup Folder</Grid>
          <Grid size={9}>
            <input
              type="text"
              style={{ width: '100%' }}
              value={backupFolder}
              onChange={(e) => setBackupFolder(e.target.value)}
            />
          </Grid>
        </Grid>

        <h3>Git repository settings</h3>

        <Grid container spacing={2}>
          <Grid size={3}>Username</Grid>
          <Grid size={9}>
            <input type="text" style={{ width: 200 }} />
          </Grid>
          <Grid size={3}>Passcode</Grid>
          <Grid size={9}>
            <input type="text" style={{ width: 200 }} />
          </Grid>
        </Grid>

        <p>
          <Button variant="outlined">Save</Button>
        </p>
      </form>
    </>
  );
};
