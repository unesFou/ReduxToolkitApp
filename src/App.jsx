// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import store from './app/store';
import { loadUserFromStorage } from './features/authSlice/authSlice';
import Authentication from './component/Authentication/Authentication';
import Dashboard from './component/dashboard/Dashboard';
import NavBarApp from './navBar/NavBarApp';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <Provider store={store}>
      <Router>
        {!user ? (
          <Authentication />
        ) : (
          <>
          <NavBarApp user={user} />
          <Dashboard />
          </>
        )}
      </Router>
    </Provider>
  );
};

export default App;
