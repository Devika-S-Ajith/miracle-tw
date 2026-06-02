import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Paper, OutlinedInput, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoSideBar from '../../../assets/LogoSideBar';


const dummyPreviewMobile = ({ content }) => {
    return (
        <div style={{ maxWidth: '320px', margin: '0 auto', backgroundColor: '#F7F8FA' }}>
            {/* AppBar */}
            <AppBar position="static" style={{ backgroundColor: '#f16d24' }}>
                <Toolbar style={{ justifyContent: 'space-between' }}>
                    <LogoSideBar
                        width='150px'
                    />

                    <div>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <MenuIcon />
                        </IconButton>
                        <IconButton edge="end" color="inherit">
                            <NotificationsIcon />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Notification Card */}
            <div style={{ padding: '16px 16px' }}>{content}</div>

            {/* Upcoming Assessments */}
            <div style={{ padding: '0 16px' }}>
                <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Upcoming Assessments <CalendarTodayIcon />
                </Typography>

                {/* Calendar Placeholder */}
                <Paper style={{ marginTop: '16px', position: 'relative', padding: '0', overflow: 'hidden' }}>
                    <img
                        style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
                        src={'/static/Calendar.png'}
                        alt="Calendar"
                    />
                </Paper>
            </div>

            {/* Search Bar */}
            <Box style={{ marginTop: '16px', margin: '16px', display: 'flex', alignItems: 'center' }}>
                <OutlinedInput
                    placeholder="Search"
                    inputProps={{ 'aria-label': 'search' }}
                    style={{ flex: 1 }}
                    readOnly='true'
                    variant='outlined'
                />
                <IconButton type="submit" aria-label="search">
                    <FilterListIcon />
                </IconButton>
            </Box>
        </div>
    );
};

export default dummyPreviewMobile;
