import React, { createContext, useState, useContext } from "react";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

const ToastContext = createContext();

export const useToaster = () => useContext(ToastContext);

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export const ToastContextProvider = ({ children }) => {
    const [snackInfo, setSnackInfo] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const updateToast = (message, severity = "success") => {
        if (message === "") {
            setSnackInfo({
                open: false,
                message: "",
                severity: severity,
            });
            return;
        }
        setSnackInfo({
            open: true,
            message: message,
            key: message + new Date().getTime(),
            severity: severity,
        })
    }
    const handleClose = (event, reason) => {
        updateToast("");
    };

    return <ToastContext.Provider value={updateToast}>
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            key={snackInfo.key}
            open={snackInfo.open}
            autoHideDuration={5000}
            onClose={handleClose}
            // message={snackInfo.message}
            action={
                <React.Fragment>
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </React.Fragment>
            }
        >
            <Alert onClose={handleClose} severity={snackInfo.severity}>
                {snackInfo.message}
            </Alert>
        </Snackbar>
        {children}
    </ToastContext.Provider >;
}
