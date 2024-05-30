import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import store from './app/store';
import { loadUserFromStorage } from './features/authSlice/authSlice';
import Authentication from './component/Authentication/Authentication';
import Dashboard from './component/dashboard/Dashboard';
import NavBarApp from './navBar/NavBarApp';
import LeftMenu from './LeftMenu/LeftMenu';


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={!user ? <Authentication /> : <Layout handleDrawerToggle={handleDrawerToggle} mobileOpen={mobileOpen} />}>
            <Route path="dashboard" element={<Dashboard />}>
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};

const Layout = ({ handleDrawerToggle, mobileOpen }) => {
  const user = useSelector((state) => state.auth.user);
  return (
    <div style={{ display: 'flex' }}>
      <NavBarApp user={user} handleDrawerToggle={handleDrawerToggle} />
      <LeftMenu handleDrawerToggle={handleDrawerToggle} mobileOpen={mobileOpen} />
      <main style={{ flexGrow: 12, paddingLeft: '0%' , paddingTop:'5%' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default App;
