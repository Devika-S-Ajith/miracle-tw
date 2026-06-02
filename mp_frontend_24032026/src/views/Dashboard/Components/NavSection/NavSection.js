import PropTypes from 'prop-types';
import { matchPath } from 'react-router-dom';
import { List, ListSubheader } from '@material-ui/core';
import NavItem from '../NavItem';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const renderNavItems = ({ depth = 0, items, pathname,open,setOpen,t }) => (
  <List disablePadding>
    {items.reduce(
      // eslint-disable-next-line no-use-before-define
      (acc, item) => reduceChildRoutes({
        acc,
        item,
        pathname,
        depth,open,setOpen,t
      }), []
    )}
  </List>
);

const reduceChildRoutes = ({ acc, pathname, item, depth,open,setOpen,t }) => {
  const key = `${item.title}-${depth}`;
  
 
   const handleClick =()=>{
    setOpen(!open)
   }

  const exactMatch = item.path ? !!matchPath({
    path: item.path,
    end: true
  }, pathname) : false;
   
  

  if (item.path === '/dashboard') {
    acc.push(
      <NavItem
        active={exactMatch}
        depth={depth}
        icon={item.icon}
        info={item.info}
        key={key}
        path={item.path}
        title={item.title}
      />
    );
  } else {
    if(item.title==='Database'){
      
        acc.push(
          <List>
          <ListItemButton onClick={handleClick} >
            <ListItemIcon sx={(pathname===item.items[1]?.path ||pathname===item.items[0]?.path) ? {
               color: 'primary.main',
               fontWeight: 'fontWeightBold',
               ml:-0.5,
               variant:"text",
               '& svg': {
                 color: 'primary.main'}}:{
                color: 'text.secondary',
                fontWeight: 'fontWeightMedium',
                fontSize: '0.75rem',
                lineHeight: 2.5,
                ml:-0.5,
                }
                //textTransform: 'uppercase'
              }>
             {item.icon}
            </ListItemIcon>
            <ListItemText  disableTypography ={true} primary={t(`common:common.${item.title}`)} sx={(pathname===item.items[1]?.path ||pathname===item.items[0]?.path) ? {
               color: 'primary.main',
               fontWeight: 'fontWeightBold',
               ml:-1,
               fontSize:'14px',
               variant:"text",
               '& svg': {
                 color: 'primary.main'}}:{
                color: 'text.secondary',
                fontWeight: 'fontWeightMedium',
                fontSize:'14px',
                ml:-1,
                textTransform: 'none',
                width: '100%',
                }
                //textTransform: 'uppercase'
              }/>
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
           { renderNavItems({
              items:item.items,
              pathname,
              depth:2
            })}
          </Collapse>
        </List>
         
        );
        
    }
    else{
      const partialMatch = item.path ? !!matchPath({
        path: item.path,
        end: false
      }, pathname) : false;
      acc.push(
        <NavItem
          active={partialMatch}
          depth={depth}
          icon={item.icon}
          info={item.info}
          key={key}
          path={item.path}
          title={item.title}
        />
      );
    }
    
  }

  return acc;
};

const NavSection = (props) => {
  const { items, pathname, title, ...other } = props;
  const { t } = useTranslation(['common']);
  const [open,setOpen] = useState(false)
  return (
    <List
      subheader={(
        <ListSubheader
          disableGutters
          disableSticky
          sx={{
            color: 'text.primary',
            fontSize: '0.75rem',
            lineHeight: 2.5,
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          {t(`common:common.${title}`)}
          {/* {title} */}
        </ListSubheader>
      )}
      {...other}
    >
      {renderNavItems({
        items,
        pathname,open,setOpen,t
      })}
    </List>
  );
};

NavSection.propTypes = {
  items: PropTypes.array,
  pathname: PropTypes.string,
  title: PropTypes.string
};

export default NavSection;
