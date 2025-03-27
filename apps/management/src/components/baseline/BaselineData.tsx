import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { getBaselineData, updateBaselineData } from '../../api/api';
import { AddBaselineTaxons } from './AddBaselineTaxons';
import { Spinner } from '../loading/spinner';
import { BaselineInatData } from '../../api/inat';
import { DataTable } from './DataTable';

export const BaselineData = () => {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [addBaselineTaxonDialogOpen, setBaselineTaxonDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [baselineData, setBaselineData] = useState<BaselineInatData[]>([]);

  useEffect(() => {
    (async () => {
      const resp = await getBaselineData();
      const { data } = await resp.json();

      setLoading(false);
    })();
  }, []);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaved(false);
    setLoading(true);

    // const resp = await updateBaselineData({ backupFolder });
    // const { success, error: updateConfigError } = await resp.json();
    // if (success) {
    //   setError('');
    //   setSaved(true);
    // } else {
    //   setError(updateConfigError);
    // }

    setLoading(false);
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
      <Button
        variant="outlined"
        type="submit"
        size="small"
        onClick={() => setBaselineTaxonDialogOpen(true)}
        style={{ float: 'right' }}
      >
        Add Species
      </Button>
      <h2>Baseline Data</h2>
      {loader}
      {getAlert()}
      <p>
        iNat may or may not have observations for all the species for your taxon and place. This section allows you to
        supplement the iNat observation data with <i>species that you know to exist in the region</i>.
      </p>
      <p>Ideally you'll want to keep this list short, but it's often.</p>
      <p>
        None of the species you enter here will ever appear in the "New Additions" section. If you see there are plenty
        of observations on iNat for a species and want to delete the baseline entry, it'll suggest you add the taxon to
        be omitted to ever show up on the New Additions section.
      </p>
      [add "ignore list" to New Additions] [taxon ID] [Species name] [link to iNat] [number of observations confirmed by
      curators, with earliest obs date] [delete]
      <AddBaselineTaxons
        open={addBaselineTaxonDialogOpen}
        onClose={() => setBaselineTaxonDialogOpen(false)}
        onComplete={(data: BaselineInatData[]) => setBaselineData(data)}
      />
      {baselineData.length && <DataTable data={baselineData} />}
    </>
  );
};
