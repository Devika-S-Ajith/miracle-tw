import * as React from 'react';
import { Select, MenuItem } from '@mui/material';

const ListPaging = ({ rowCount, handleRowCountChange, rowCountOptions }) => {
	const options = rowCountOptions || [10, 20, 30];
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
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
        </>
    )
}

export default ListPaging