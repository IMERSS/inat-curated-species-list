import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { getInatBaselineSpeciesData } from '../../api/baselineSpecies';
import { BaselineSpeciesInatData } from '../../types';
import classes from './baseline.module.css';

type AddBaselineTaxonsDialogProps = {
  open: boolean;
  onComplete: (data: BaselineSpeciesInatData[]) => void;
  onClose: () => void;
};

export const AddBaselineTaxonsDialog = ({ open, onClose, onComplete }: AddBaselineTaxonsDialogProps) => {
  const [ids, setIds] = useState('');
  const [loading, setLoading] = useState(false);

  const loadingOverlay = loading ? (
    <div className={classes.dialogLoadingOverlay}>
      <CircularProgress color="inherit" />
    </div>
  ) : null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            component: 'form',
            className: loading ? classes.dialogLoading : '',
            onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              setLoading(true);
              const data = await getInatBaselineSpeciesData(ids);
              setLoading(false);
              onComplete(data);
            },
          },
        }}
      >
        <DialogTitle>Add Baseline Species</DialogTitle>
        <DialogContent>
          {loadingOverlay}
          <DialogContentText>
            Enter a comma-delimited list of iNaturalist species (taxon) IDs to be added to your baseline species list.
            This will append to your existing list and duplicates will be automatically removed.
          </DialogContentText>
          <textarea
            autoFocus
            required
            id="ids"
            style={{ width: '100%', height: 100, marginTop: 10 }}
            value={ids}
            onChange={(e) => setIds(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
      {loadingOverlay}
    </>
  );
};
