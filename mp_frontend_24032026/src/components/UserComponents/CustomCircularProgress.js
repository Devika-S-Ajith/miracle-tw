
import {
    CircularProgress
} from '@mui/material';

const CustomCircularProgress = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px', width: '50px' }}>
            <CircularProgress
                sx={{
                    zIndex: 1000,
                }}
                size="1.5rem"
                color="primary" />
        </div>
    )

}


export default CustomCircularProgress; 