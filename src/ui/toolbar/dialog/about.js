import React from 'react'
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography'

import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from './customDialog'
import { useUIStateContext } from '../../../context/ui'


export const AboutDialog = props => {
    const {
    isAboutDialogOpen,
    setIsAboutDialogOpen
  } = useUIStateContext()

  const open = isAboutDialogOpen
  const handleClose = () => { setIsAboutDialogOpen(false) }
  
  return (
    <div>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} scroll={'paper'} >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          ALEA-0 (ālēə nôt)
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            ok
          </Typography>
          <Typography gutterBottom>
            hmm
          </Typography>
          <Typography gutterBottom>
            yay
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
