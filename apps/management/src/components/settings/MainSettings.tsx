import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { getMainConfig, updateMainConfig } from '../../utils/api';
import { Spinner } from '../loading/spinner';

export const MainSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    (async () => {
      const resp = await getMainConfig();
      const { config } = await resp.json();

      if (config.backupFolder) {
        // setBackupFolder(config.backupFolder);
      }
      setLoading(false);
    })();
  }, []);

  const updateData = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaved(false);
    setLoading(true);

    // const resp = await updateMainConfig({ backupFolder });
    // const { success, error: updateConfigError } = await resp.json();
    // if (success) {
    //   setError('');
    //   setSaved(true);
    // } else {
    //   setError(updateConfigError);
    // }

    // setLoading(false);
  };

  const loader = loading ? <Spinner /> : null;

  const getAlert = () => {
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (saved) {
      return <Alert severity="success">The settings have been saved.</Alert>;
    }

    return null;
  };

  return (
    <>
      <h2>Main Settings</h2>

      {loader}
      {getAlert()}

      <p></p>

      <form onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid size={3}>Curators</Grid>
          <Grid size={9}>
            <input
              type="text"
              style={{ width: '100%' }}
              value={settings.curators}
              onChange={(e) => updateData('curators', e.target.value)}
            />
          </Grid>
          <Grid size={3}>Taxon ID</Grid>
          <Grid size={9}>
            <input
              type="number"
              style={{ width: 80 }}
              value={settings.taxonId}
              onChange={(e) => updateData('taxonId', e.target.value)}
            />
          </Grid>
          <Grid size={3}>Place ID</Grid>
          <Grid size={9}>
            <input
              type="number"
              style={{ width: 80 }}
              value={settings.placeId}
              onChange={(e) => updateData('placeId', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <input
              type="checkbox"
              checked={settings.provideBaselineData}
              onChange={(e) => updateData('provideBaselineData', e.target.checked)}
            />
            Provide baseline data
          </Grid>
          <Grid size={12}>
            <input
              type="checkbox"
              checked={settings.trackNewAdditions}
              onChange={(e) => updateData('trackNewAdditions', e.target.checked)}
            />
            Track new additions
          </Grid>
          <Grid size={12}>
            <input
              type="checkbox"
              checked={settings.trackTaxonChanges}
              onChange={(e) => updateData('trackTaxonChanges', e.target.value)}
            />
            Track taxon changes
          </Grid>
        </Grid>

        {/* omitTaxonChangeIds */}

        <p>
          <Button variant="outlined" type="submit">
            Save
          </Button>
        </p>
      </form>
    </>
  );
};
