import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import { useTranslation } from 'react-i18next';
import { TwitterFollowButton } from 'react-twitter-embed';
import { Trans } from 'react-i18next';

const emails = ['username@gmail.com', 'user02@gmail.com'];
const useStyles = makeStyles({
    root: {
        margin: "8px",
    },
});

function AboutDialog({ onClose, open }) {
    const classes = useStyles();
    const { t } = useTranslation();

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle id="simple-dialog-title">{t("About OpenKen")}</DialogTitle>

            <div className={classes.root}>
                <p>
                    <Trans i18nKey="aboutDescription">
                        Project description。
                    </Trans>
                </p>

                <p>
                    <Trans i18nKey="aboutGithub">
                        The project is opensourced <a href="https://github.com/kenkawakenkenke/openken" target="_blank">here</a>.
                    </Trans>
                </p>

                <p>
                    <Trans i18nKey="aboutFollowMe">
                        If you have comments, recommendations, or simply liked this project, please follow me on Twitter:
                    </Trans>
                    <TwitterFollowButton screenName={'kenkawakenkenke'} />
                </p>
            </div>
        </Dialog>
    );
}

AboutDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

export default AboutDialog;
