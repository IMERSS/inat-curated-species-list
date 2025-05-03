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
import { BaselineSpeciesInatData, RegionSpecies } from '../../types';
import { MainSettings } from '../../types';

export type BaselineSpeciesProps = {
  readonly isLoading: boolean;
  readonly isLoaded: boolean;
  readonly data: BaselineSpeciesInatData[];
  readonly setLoading: () => void;
  readonly loadBaselineData: () => void;
};

export const BaselineSpecies = ({ isLoading, isLoaded, data, setLoading, loadBaselineData }: BaselineSpeciesProps) => {
  // const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // const [mainSettings, setMainSettings] = useState<MainSettings | {}>({});
  const [addBaselineTaxonDialogOpen, setBaselineTaxonDialogOpen] = useState(false);
  const [validateBaselineTaxonDialogOpen, setValidateBaselineTaxonDialogOpen] = useState(false);
  // const [baselineSpecies, setBaselineSpecies] = useState<BaselineSpeciesInatData[]>([]);

  useEffect(() => {
    if (!isLoaded) {
      loadBaselineData();
    }
  }, []);

  const onSubmit = async (e?: any) => {
    e.preventDefault();
    // setSaving(true);

    const resp = await updateBaselineSpecies(data);
    const { success, error: updateConfigError } = await resp.json();

    // setSaving(false);

    if (success) {
      setError('');
      setSaved(true);
    } else {
      setError(updateConfigError);
    }
  };

  const onDeleteRow = (taxonId: number) => {
    const updatedBaselineSpecies = data.filter(({ id }) => id !== taxonId);
    setBaselineSpecies(updatedBaselineSpecies);
  };

  const loader = isLoading ? <Spinner /> : null;

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
    if (isLoading) {
      return 'loading...';
    }

    if (!data.length) {
      return <Alert severity="info">You haven't provided any baseline species.</Alert>;
    }

    return (
      <>
        <DataTable data={data} onDeleteRow={onDeleteRow} />
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
      {data.length > 0 && (
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
        <small>
          Last validated: <b>...</b>
        </small>
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

      {/* <ValidateBaselineSpeciesDialog
        placeId={mainSettings.placeId}
        taxonId={mainSettings.taxonId}
        open={validateBaselineTaxonDialogOpen}
        onClose={() => setValidateBaselineTaxonDialogOpen(false)}
        onComplete={(latestData: RegionSpecies) => {
          const updatedBaselineSpeciesData = baselineSpecies.map((row) => {
            if (latestData[row.id]) {
              return {
                ...row,
                isActive: latestData[row.id].isActive,
                researchGradeReviewCount: latestData[row.id].count,
              };
            }

            // TODO this should never occur. Remove altogether?
            return row;
          });

          // setBaselineSpecies(updatedBaselineSpeciesData);
          setValidateBaselineTaxonDialogOpen(false);
        }}
      /> */}

      {getContent()}
      <BaselineDocDialog open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
