import React ,{useState} from 'react';
import {
    ListItemIcon,
    ListItemText,
    List,
    ListItem,
    Collapse,
    Typography,
    Box,
    Divider
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const CollapseList = (props) => {

    const { individualLanguageSection , onChangeLanguage} = props;
    //const [openSection, setOpenSection] = useState(false);
    const [openSection, setOpenSection] = useState({});
  
    const handleToggleSection = (languageId) => {
        setOpenSection((prevState) => ({
            ...prevState,
          [languageId]: !prevState[languageId],
        }));
      };
    
    return (
        <>
            <ListItem button key={individualLanguageSection.Id} onClick={() => handleToggleSection(individualLanguageSection.Id)}>
                <ListItemText primary={<Typography variant='subtitle2'>{individualLanguageSection.Name}</Typography>} />
                <ListItemIcon>
                    <Box
                        sx={{
                            display: 'flex',
                            height: 25,
                            width: 25,
                        }}
                    >
                        <img
                            alt={individualLanguageSection.label}
                            src={individualLanguageSection.icon}
                            height="25px"
                            width="25px"
                        /></Box>
                </ListItemIcon>
                {openSection[individualLanguageSection.Id]? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse
                key={individualLanguageSection.Id}
                in={openSection[individualLanguageSection.Id]}
                timeout='auto'
                unmountOnExit
            >
                <List component='li' disablePadding key={individualLanguageSection.Id}>
                    {individualLanguageSection.language.map(language => {
                        return (
                            <ListItem onClick={() => onChangeLanguage(language.value)} button key={language.value}>
                                <ListItemIcon>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            height: 30,
                                            width: 30,
                                        }}
                                    >
                                        <img
                                            alt={language.label}
                                            src={language.icon}
                                            height="30px"
                                            width="30px"
                                        /></Box>
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={{fontSize: '14px'}}  key={language.value} primary={language.label} />
                            </ListItem>
                        );
                    })}
                </List>
            </Collapse>
            <Divider />
        </>
    )
}

export default CollapseList