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
import { setDates } from '../features/dateSlice/dateSlice';

import './NavBarApp.css';

const NavBarApp = ({ user, handleDrawerToggle }) => {
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector((state) => state.dates);
  const { data } = useSelector((state) => state.dashboard);

  const handleLogout = () => {
    dispatch(logout());
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleDateChange = (args) => {
    const { start, end } = args;
  
    // Ensure start and end are valid Date objects
    const updatedStartDate = new Date(start);
    const updatedEndDate = new Date(end);
    updatedStartDate.setHours(8, 0, 0, 0);
    updatedEndDate.setHours(23, 59, 0, 0); // 23:59 for the end date
  
    // Dispatch updated start and end dates with time
    dispatch(setDates({
      startDate: updatedStartDate,
      endDate: updatedEndDate,
    }));
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
    const selectedOption = (Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []).find(item => item.name === newValue?.name);
    if (selectedOption) {
      dispatch(setSelectedId(selectedOption.id));
    } else {
      dispatch(setSelectedId(''));
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
              options={Array.isArray(data?.data) ? data.data : []} // Vérifie si data.data est un tableau
              getOptionLabel={(option) => option.name || ''} // Gère les cas où name est absent
              inputValue={searchValue}
              onInputChange={handleSearchInputChange}  // Met à jour l'entrée
              onChange={handleSearchChange}  // Met à jour l'option sélectionnée
              renderInput={(params) => (
                <TextField 
                  {...params}
                  placeholder="Search unité…"
                  variant="outlined"
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
              <Badge badgeContent={4} color="secondary">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton aria-label="show 17 new notifications" color="inherit">
              <Badge badgeContent={17} color="secondary">
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
