import * as React from 'react';
import { Select, MenuItem } from '@mui/material';

const ListPaging = ({ rowCount, handleRowCountChange }) => {
    return (
        <>
            <Select
                labelId="rowCountSelect"
                id="rowCount"
                size='small'
                value={rowCount}
                onChange={handleRowCountChange}
                sx={{
                    borderRadius: "1px",
                    fontWeight: "bold",
                    fontSize: "12px",
                    outline: "none",
                    cursor: "pointer",
                }}
            >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
            </Select>
        </>
    )
}

export default ListPaging