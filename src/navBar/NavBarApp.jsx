import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import PersonIcon from '@material-ui/icons/Person';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { logout } from '../features/authSlice/authSlice';
import { setSelectedId } from '../features/searchSlice/searchSlice';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DateRangePickerComponent from '../component/DatePicker/DateRangePicker';
//import { fetchDashboardData } from "../features/dashboardSlice/dashboardSlice";
import { ressetDateRange, setDates } from '../features/dateSlice/dateSlice';
import { useCookies } from 'react-cookie'; // Importer useCookies de react-cookie
import { persistor } from '../app/store';
import './NavBarApp.css';

const NavBarApp = ({ user, handleDrawerToggle }) => {
  const dispatch = useDispatch();
  const { date_start, date_end } = useSelector((state) => state.dates);
  const { data } = useSelector((state) => state.dashboard);
  const [cookies, setCookie, removeCookie] = useCookies(); // Initialiser cookies, setCookie et removeCookie
  
  const deleteAllCookies = () => {
    const cookies = document.cookie.split(";");
  
    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };
  
  const handleLogout = async () => {
    try {
      // Effacer le Redux Store persisté
      dispatch(ressetDateRange());
      localStorage.clear();
      sessionStorage.clear();
      deleteAllCookies(); // Supprimer tous les cookies
  
      // Supprimer les caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      }
  
      // Purge du persistor
      await persistor.flush(); // Flusher avant de purger
      await persistor.purge(); // Purge du stockage persisté
  
      // Déconnexion
      dispatch(logout());
  
      // Redémarrage de la page ou redirection
      window.location.reload(); // Recharge de la page pour réinitialiser l'application
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };
  

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleDateChange = (newStartDate, newEndDate) => {
    const adjustedStartDate = new Date(newStartDate);
    adjustedStartDate.setHours(7, 0, 0, 0); // Fixe à 07:00
  
    const adjustedEndDate = new Date(newEndDate);
    adjustedEndDate.setHours(23, 59, 59, 999); // Fixe à 23:59
  
    // Mettez à jour les dates dans le store ou le state
    dispatch(setDates({
      date_start: adjustedStartDate.toISOString().slice(0,16),
      date_end: adjustedEndDate.toISOString().slice(0,16),
    }));
  
    // // Rechargez les données avec les nouvelles dates
    // dispatch(fetchDashboardData({
    //   date_start: adjustedStartDate.toISOString(),
    //   date_end: adjustedEndDate.toISOString(),
    // }));
  };
  
  

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // const handleSearchInputChange = (event, value, reason) => {
  //   setSearchValue(value);
  //   const selectedOption = data.find(item => item.name === value);
  //   if (selectedOption) {
  //     dispatch(setSelectedId(selectedOption.id));
  //   } else {
  //     dispatch(setSelectedId(''));
  //   }
  // };
  const handleSearchInputChange = (event, value) => {
    setSearchValue(value);
  };
  
  const handleSearchChange = (event, newValue) => {
    let selectedOption = '';
    if (newValue != null){
       selectedOption = Array.isArray(data) ? data.find((item) => item.name === newValue.name) : null;
    }
    if (selectedOption) {
      dispatch(setSelectedId(selectedOption.id)); // Met à jour l'id sélectionné dans Redux
    } else {
      dispatch(setSelectedId('')); // Réinitialise si aucune option n'est sélectionnée
    }
  };
  

  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker);
  };

  const StyledMenu = withStyles({
    paper: {
      border: '0px solid #d3d4d5',
    },
  })((props) => (
    <Menu
      elevation={0}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      {...props}
    />
  ));

  const StyledMenuItem = withStyles((theme) => ({
    root: {
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
          color: theme.palette.common.white,
        },
      },
    },
  }))(MenuItem);

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <StyledMenu id="customized-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)}>
        <StyledMenuItem>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Mon compte" />
        </StyledMenuItem>
        <StyledMenuItem onClick={handleLogout}>
          <ListItemIcon>
            <PowerSettingsNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="se déconnécter" />
        </StyledMenuItem>
      </StyledMenu>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';

  return (
    <div className="root">
      <AppBar position="fixed" className="appBar">
        <Toolbar className="toolbar">
        <h5>S.C.T</h5>
          <div className="leftSection">
            <Hidden mdUp>
              <IconButton
                edge="start"
                className="menuButton"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
          </div>
          <div className="rightSection">
          <Box sx={{ width: 300 }}>
            <Autocomplete
              freeSolo
              options={Array.isArray(data) ? data : []} // Vérifie si data.data est un tableau
              getOptionLabel={(option) => option.name || ''} // Gère les cas où name est absent
              inputValue={searchValue}
              onInputChange={handleSearchInputChange}  // Met à jour l'entrée
              onChange={handleSearchChange}  // Met à jour l'option sélectionnée
              renderInput={(params) => (
                <TextField 
                  {...params}
                  placeholder="Search unité…"
                 // variant="outlined"
                 style={{color:'white'}}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <IconButton aria-label="search">
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                />
              )}
            />
          </Box>

            <Button variant="contained" color="primary" onClick={handleDatePickerToggle}>
              Choisir une Date ?
            </Button>
            <IconButton aria-label="show 4 new mails" color="inherit">
              <Badge badgeContent={''} color="secondary">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton aria-label="show 17 new notifications" color="inherit">
              <Badge badgeContent={''} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <span>{user.name}</span>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
      <Dialog open={showDatePicker} onClose={handleDatePickerToggle} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Choisir une Date</DialogTitle>
        <DialogContent>
          <DateRangePickerComponent
            change={handleDateChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDatePickerToggle} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDatePickerToggle} color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NavBarApp;
