import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { getBaselineSpecies, updateBaselineSpecies } from '../../api/api';
import { AddBaselineTaxons } from './AddBaselineTaxons';
import { Spinner } from '../loading/spinner';
import { DataTable } from './DataTable';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { combineSpeciesLists } from '../../utils';
import { BaselineSpeciesInatData } from '../../types';

export const BaselineSpecies = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [addBaselineTaxonDialogOpen, setBaselineTaxonDialogOpen] = useState(false);
  const [baselineSpecies, setBaselineSpecies] = useState<BaselineSpeciesInatData[]>([]);

  useEffect(() => {
    (async () => {
      const resp = await getBaselineSpecies();
      const { data } = await resp.json();

      setBaselineSpecies(data);
      setLoading(false);
    })();
  }, []);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    const resp = await updateBaselineSpecies(baselineSpecies);
    const { success, error: updateConfigError } = await resp.json();

    setSaving(false);

    if (success) {
      setError('');
      setSaved(true);
    } else {
      setError(updateConfigError);
    }
  };

  const onDeleteRow = (taxonId: number) => {
    const updatedBaselineSpecies = baselineSpecies.filter(({ id }) => id !== taxonId);
    setBaselineSpecies(updatedBaselineSpecies);
  };

  const loader = loading ? <Spinner /> : null;

  const getAlert = () => {
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (saved) {
      return <Alert severity="success">The baselines species have been saved.</Alert>;
    }

    return null;
  };

  const getContent = () => {
    if (loading) {
      return 'loading...';
    }

    if (!baselineSpecies.length) {
      return <Alert severity="info">You haven't provided any baseline species.</Alert>;
    }

    return (
      <>
        <DataTable data={baselineSpecies} onDeleteRow={onDeleteRow} />
        <p>
          <Button type="button" variant="outlined" size="small" onClick={onSubmit}>
            Save
          </Button>
        </p>
      </>
    );
  };

  return (
    <>
      {baselineSpecies.length > 0 && (
        <Button
          variant="outlined"
          type="submit"
          size="small"
          onClick={() => setBaselineTaxonDialogOpen(true)}
          style={{ float: 'right', marginTop: 10, marginLeft: 10 }}
          color="secondary"
        >
          Validate
        </Button>
      )}
      <Button
        variant="outlined"
        type="submit"
        size="small"
        onClick={() => setBaselineTaxonDialogOpen(true)}
        style={{ float: 'right', marginTop: 10 }}
        startIcon={<AddCircleOutlineIcon />}
      >
        Add Species
      </Button>

      <h2>Baseline Species</h2>

      {loader}
      {getAlert()}

      <p>
        <small>Last validated: ...</small>
      </p>

      <AddBaselineTaxons
        open={addBaselineTaxonDialogOpen}
        onClose={() => setBaselineTaxonDialogOpen(false)}
        onComplete={(data: BaselineSpeciesInatData[]) => {
          const updatedList = combineSpeciesLists(baselineSpecies, data);

          setBaselineSpecies(updatedList);
          setBaselineTaxonDialogOpen(false);
        }}
      />

      {getContent()}
    </>
  );
};
