import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { loadUserFromStorage } from './features/authSlice/authSlice';
import Authentication from './component/Authentication/Authentication';
import Dashboard from './component/dashboard/Dashboard';
import Statistiques from './component/statistiques/statistiques';
import Historique from './component/historique/historique';
import NavBarApp from './navBar/NavBarApp';
import LeftMenu from './LeftMenu/LeftMenu';
import Profil from './component/profil/Profil';
import TimeLinesToAll from './component/TimeLinesToAll/TimeLinesToAll';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

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
          {/* Redirection vers le Dashboard après authentification */}
          <Route
            path="/"
            element={!user ? <Authentication /> : <Navigate to="/dashboard" />}
          />
          {/* Si l'utilisateur est authentifié, il pourra naviguer dans les autres pages */}
          <Route path="/" element={user ? <Layout handleDrawerToggle={handleDrawerToggle} mobileOpen={mobileOpen} /> : <Navigate to="/" />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="TimeLinesToAll" element={<TimeLinesToAll />} />
            <Route path="statistiques" element={<Statistiques />} />
            <Route path="historique" element={<Historique />} />
            <Route path="profil" element={<Profil />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};

const Layout = ({ handleDrawerToggle, mobileOpen }) => {
  const user = useSelector((state) => state.auth.user);
  return (
    <>
      <NavBarApp user={user} handleDrawerToggle={handleDrawerToggle} />
      <div className="layout">
        <div className={`left-menu ${mobileOpen ? 'open' : ''}`}>
          <LeftMenu handleDrawerToggle={handleDrawerToggle} mobileOpen={mobileOpen} />
        </div>
        <div className="main-content">
          <Outlet className="container"/>
        </div>
      </div>
    </>
  );
};

export default App;
