import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Info from '@mui/icons-material/InfoOutlined';
import { getBaselineSpecies, updateBaselineSpecies, getMainSettings } from '../../api/api';
import { AddBaselineTaxonsDialog } from './AddBaselineTaxonsDialog';
import { ValidateBaselineSpeciesDialog } from './ValidateBaselineSpeciesDialog';
import { Spinner } from '../loading/spinner';
import { DataTable } from './DataTable';
import { BaselineDocDialog } from './BaselineDocDialog';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { combineSpeciesLists } from '../../utils';
import { BaselineSpeciesInatData } from '../../types';
import { MainSettings } from '../../types';

export const BaselineSpecies = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mainSettings, setMainSettings] = useState<MainSettings | {}>({});
  const [addBaselineTaxonDialogOpen, setBaselineTaxonDialogOpen] = useState(false);
  const [validateBaselineTaxonDialogOpen, setValidateBaselineTaxonDialogOpen] = useState(false);
  const [baselineSpecies, setBaselineSpecies] = useState<BaselineSpeciesInatData[]>([]);

  useEffect(() => {
    (async () => {
      // TODO parallelize
      const mainSettingsResp = await getMainSettings();
      const { settings } = await mainSettingsResp.json();
      setMainSettings(settings);

      const resp = await getBaselineSpecies();
      const a = await resp.json();

      setBaselineSpecies(a.data);
      setLoading(false);
    })();
  }, []);

  console.log({ mainSettings });

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
        <p>
          <input type="checkbox" />
          Auto-remove from baseline species list when # curator reviews exceeds{' '}
          <input type="number" style={{ width: 30 }} value={5} />
        </p>

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
          onClick={() => setValidateBaselineTaxonDialogOpen(true)}
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

      <h2>
        Baseline Species <Info onClick={() => setShowHelp(true)} />
      </h2>

      {loader}
      {getAlert()}

      <p>
        <small>Last validated: ...</small>
      </p>

      <AddBaselineTaxonsDialog
        open={addBaselineTaxonDialogOpen}
        onClose={() => setBaselineTaxonDialogOpen(false)}
        onComplete={(data: BaselineSpeciesInatData[]) => {
          const updatedList = combineSpeciesLists(baselineSpecies, data);
          setBaselineSpecies(updatedList);
          setBaselineTaxonDialogOpen(false);
        }}
      />
      <ValidateBaselineSpeciesDialog
        placeId={mainSettings.placeId}
        taxonId={mainSettings.taxonId}
        open={validateBaselineTaxonDialogOpen}
        onClose={() => setValidateBaselineTaxonDialogOpen(false)}
        onComplete={(data: BaselineSpeciesInatData[]) => {
          console.log(data);
          // setBaselineSpecies(data);
          // setBaselineTaxonDialogOpen(false);
        }}
      />

      {getContent()}
      <BaselineDocDialog open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
