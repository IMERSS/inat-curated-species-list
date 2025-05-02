import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import { getRegionSpecies } from '../../api/inat';
import { BaselineSpeciesInatData } from '../../types';

type ValidateBaselineSpeciesDialogProps = {
  placeId: number;
  taxonId: number;
  open: boolean;
  onComplete: (data: BaselineSpeciesInatData[]) => void;
  onClose: () => void;
};

export const ValidateBaselineSpeciesDialog = ({
  placeId,
  taxonId,
  open,
  onClose,
  onComplete,
}: ValidateBaselineSpeciesDialogProps) => {
  const [loadingSection, setLoadingSection] = useState(0);

  useEffect(() => {
    if (open) {
      (async () => {
        const data = await getRegionSpecies(placeId, taxonId);
        console.log(data);
      })();
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            component: 'form',
          },
        }}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>Validate Baseline Species</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers={true}>
          <Stepper activeStep={loadingSection} orientation="vertical">
            <Step key="1">
              <StepLabel>
                Updating research grade counts
                {loadingSection === 0 && <CircularProgress color="inherit" size={20} style={{ marginLeft: 10 }} />}
              </StepLabel>
            </Step>
            <Step key="2">
              <StepLabel>
                Updating curator review counts
                {loadingSection === 1 && <CircularProgress color="inherit" size={20} style={{ marginLeft: 10 }} />}
              </StepLabel>
            </Step>
            <Step key="3">
              <StepLabel>
                Checking baseline species still active
                {loadingSection === 2 && <CircularProgress color="inherit" size={20} style={{ marginLeft: 10 }} />}
              </StepLabel>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
