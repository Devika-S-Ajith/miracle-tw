import * as React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

const Loader = ({ loading,blurout = true }) => {
    return (
        <>
            <Backdrop
                sx={{
                    zIndex: 9999,
                    color: '#fff',
                    backdropFilter: blurout && 'blur(5px)',
                }}
                open={loading}
            >
                <CircularProgress color="primary" />
            </Backdrop>
        </>)
}

export default Loader