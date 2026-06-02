import { Avatar } from '@mui/material';
import React from 'react';
import BellIcon from "../../../assets/icons/Bell";
import {
    FamilyIcon,
    HomeIcon,
    ReportsIcon,
    ChildIcon,
    AssessmentIcon,
    CalendarIcon,
} from "../../../assets/icons/SideBarIcons";
import LogoSideBar from '../../../assets/LogoSideBar';

const dummyPreviewWeb = ({ content }) => {
    return (
        <div style={styles.dashboard}>
            <header style={styles.header}>
                <div style={styles.logo}>
                <LogoSideBar
                        width='150px'
                    />
                </div>
                <div style={styles.userArea}>
                    <div style={styles.notification}>
                        <BellIcon
                            sx={{
                                color: "#778791",
                                fontSize: 28,
                            }} />
                        <span style={styles.badge}>1</span>
                    </div>
                    <div style={styles.user}>
                        <Avatar
                            sx={{
                                height: 30,
                                width: 30,
                            }}
                        />
                    </div>
                </div>
            </header>
            <div style={styles.body}>
                <aside style={styles.sidebar}>
                    <nav>
                        <ul style={styles.navList}>
                            <li style={styles.navItem}>
                                <i style={styles.icon}> <HomeIcon fontSize="small" /></i>
                            </li>
                            <li style={styles.navItem}>
                                <i style={styles.icon}><ReportsIcon fontSize="small" /></i>
                            </li>
                            <li style={styles.navItem}>
                                <i style={styles.icon}><CalendarIcon fontSize="small" /></i>
                            </li>
                            <li style={styles.navItem}>
                                <i style={styles.icon}><ChildIcon fontSize="small" /></i>
                            </li>

                            <li style={styles.navItem}>
                                <i style={styles.icon}><FamilyIcon fontSize="small" /></i>
                            </li>
                            <li style={styles.navItem}>
                                <i style={styles.icon}><AssessmentIcon fontSize="small" /></i>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <div style={styles.contentArea}>
                    {content}
                    <div style={styles.breadcrumb}>
                        <span>Dashboard</span>
                    </div>
                    <div style={styles.grid}>
                        <div style={styles.smallCard}></div>
                        <div style={styles.smallCard}></div>
                        <div style={styles.smallCard}></div>
                    </div>
                    <div style={styles.largeGrid}>
                        <div style={styles.largeCard}></div>
                        <div style={styles.largeCard}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    dashboard: {
        //fontFamily: 'Arial, sans-serif',
        //height: '100vh',
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'white',
        color: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    },
    logo: {
        marginLeft: '20px',
    },
    logoText: {
        color: 'black',
        fontSize: '18px',
        margin: 0,
    },
    userArea: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '20px',
    },
    notification: {
        position: 'relative',
        marginRight: '20px',
    },
    badge: {
        position: 'absolute',
        top: '-5px',
        right: '-10px',
        backgroundColor: 'red',
        color: 'white',
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '12px',
    },
    user: {
        fontSize: '24px',
        marginTop: '-10px'
    },
    body: {
        display: 'flex',
        marginTop: '48px', // Adjust this if your header height changes
        height: 'calc(60vh - 70px)',
    },
    sidebar: {
        width: '80px',
        backgroundColor: '#172b4d',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        position: 'fixed',
        top: '70px', // Same as marginTop of body to align sidebar below the header
        left: 0, // Position at the start (left) of the screen
        height: 'calc(60vh - 70px)',
    },
    navList: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        width: '100%',
    },
    navItem: {
        margin: '20px 0',
        textAlign: 'center',
        width: '100%',
    },
    active: {
        backgroundColor: '#ff7f50',
        borderRadius: '10px',
        padding: '10px',
    },
    icon: {
        fontSize: '24px',
    },
    contentArea: {
        flexGrow: 1,
        padding: '20px',
        marginLeft: '80px', // Same as the width of the sidebar to avoid overlap
        backgroundColor: '#f5f7fa',
        height: '100%',
        width: 'calc(48vw - 80px)', // Full width minus the sidebar
        overflowY: 'hidden',
    },
    breadcrumb: {
        marginBottom: '20px',
        fontSize: '18px',
        color: '#555',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    largeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
    },
    smallCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'right',
        height: '80px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    largeCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        marginTop: '20px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'right',
        height: '250px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    cardIcon: {
        fontSize: '36px',
        color: '#777',
    },
};

export default dummyPreviewWeb;
