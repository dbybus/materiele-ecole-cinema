import React from 'react'
import { Dialog, DialogTitle, DialogContent, makeStyles, Typography, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import useIsMobile from '../hooks/useIsMobile';

const useStyles = makeStyles(theme => ({
    dialogWrapper: {
        padding: theme.spacing(2),
        position: 'absolute',
        top: theme.spacing(5),
        // Same gap at the bottom as at the top, so a tall dialog never runs past the window
        maxHeight: `calc(100% - ${theme.spacing(10)}px)`
    },
    dialogWrapperMobile: {
        padding: theme.spacing(1)
    },
    dialogTitle: {
        paddingRight: '0px'
    }
}))

function ModalPopup(props) {
    const {title, children, openPopup, setOpenPopup} = props;
    const classes = useStyles();
    const isMobile = useIsMobile();

    return (
        <Dialog
            open={openPopup}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            classes={{ paper: isMobile ? classes.dialogWrapperMobile : classes.dialogWrapper }}
        >
            <DialogTitle className={classes.dialogTitle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                    <Button onClick={()=>{setOpenPopup(false)}} aria-label="Fermer"><CloseIcon /></Button>
                </div>
            </DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default ModalPopup
