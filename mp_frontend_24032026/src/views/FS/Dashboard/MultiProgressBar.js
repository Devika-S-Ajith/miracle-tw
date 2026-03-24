import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import './MultiProgressBar.css';
import _ from 'lodash'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import BodyText from '../../../components/BodyText/BodyText';

const ProgressBar = ({ value }) => {

    const totalValue = _.sumBy(value, (val) => parseInt(val?.count))
    return (
        <><div className="progress-bar2">
            <div className="progress-container2">
                {value.map((item, index) => (
                    <Tooltip placement="top" arrow
                        sx={{
                            "&.MuiTooltip-tooltip": {
                                backgroundColor: item?.color,
                            }
                        }}
                        title={item?.count}>
                        <div
                            key={index}
                            className="progress2"
                            style={{
                                width: `${(item.count / totalValue) * 100}%`,
                                backgroundColor: item.color
                            }}
                        >
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div>
            <div className="label-container2">
                {value.map((item, index) => (
                    <div key={index} className="progress-label2">
                        <FiberManualRecordIcon fontSize="tiny" sx={{ color: item.color }} />
                        <BodyText value={item.label} fontWeight={600}/>

                        {/* <Typography variant='body2' fontWeight="bold">{item.label}</Typography> */}
                    </div>
                ))}
            </div></>
    );
};

export default ProgressBar;
