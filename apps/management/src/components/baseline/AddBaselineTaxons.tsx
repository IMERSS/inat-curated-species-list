import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type AddBaselineTaxonsProps = {
  open: boolean;
  handleClose: any;
};
export const AddBaselineTaxons = ({ open, handleClose }: AddBaselineTaxonsProps) => (
  <Dialog
    open={open}
    onClose={handleClose}
    slotProps={{
      paper: {
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const email = formJson.email;
          console.log(email);
          handleClose();
        },
      },
    }}
  >
    <DialogTitle>Add Baseline Taxons</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter a comma-delimited list of iNaturalist taxon IDs to be added as your baseline data. If you have existing
        baseline data, the items added here will be appended to the list.
      </DialogContentText>
      <textarea autoFocus required id="name" name="email" style={{ width: '100%', height: 100 }} />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      <Button type="submit">Submit</Button>
    </DialogActions>
  </Dialog>
);
