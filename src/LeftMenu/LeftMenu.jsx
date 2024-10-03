import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TimelineIcon from '@material-ui/icons/Timeline';
import DashboardIcon from '@material-ui/icons/Dashboard';
import TimerIcon from '@material-ui/icons/Timer';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import SettingsIcon from '@material-ui/icons/Settings';
import Hidden from '@material-ui/core/Hidden';
import { Link } from 'react-router-dom';

import logo from './../images/rg.png';
import './LeftMenu.css';

const LeftMenu = ({ handleDrawerToggle, mobileOpen }) => {
  const drawer = (
    <div>
      <Divider />
      <div className="menu-header p-4" >
        <img src={logo} alt="Gestion de présence Logo" className="w-12 h-8 mx-auto" style={{maxWidth: '25%'}} />
      </div>
      <List >
        {/* <ListItem button>
          <ListItemIcon><TimelineIcon /></ListItemIcon>
          <ListItemText primary="Real Time" />
        </ListItem> */}
        <ListItem button component={Link} to="/timelines">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon><TimerIcon /></ListItemIcon>
          <ListItemText primary="Temps Réels" />
        </ListItem>
        <ListItem button component={Link} to="/statistiques">
          <ListItemIcon><EqualizerIcon /></ListItemIcon>
          <ListItemText primary="Statistiques" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <nav className="drawer">
      
      <Hidden smUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{ paper: 'drawerPaper' }}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{ paper: 'drawerPaper' }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default LeftMenu;
