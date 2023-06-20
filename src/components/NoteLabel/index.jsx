import React from 'react';
import {makeStyles} from 'tss-react/mui'
import Box from "@mui/material/Box";
import styles from './NoteLabel.styles';

const useStyles = makeStyles()(styles);

function NoteLabel(props) {
    const { name, octave } = props;
    const [note, sharp] = name.split('');
    const { classes, cx } = useStyles();

    return <Box display={'flex'}>
        <Box variant={'h1'} className={cx(classes.note)}>
            {note}
        </Box>
        <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
            <Box className={cx(classes.sharp)}>
                {sharp}
            </Box>
            <Box className={cx(classes.octave)}>
                {octave}
            </Box>
        </Box>
    </Box>
}

export default NoteLabel;