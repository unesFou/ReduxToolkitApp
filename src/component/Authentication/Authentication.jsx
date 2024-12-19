import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import { login } from '../../features/authSlice/authSlice';
import image from './../../images/back.jpg';
import logo from './../../images/rg.png';

import {
  Button,
  Container,
  Card,
  CardContent,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Link,
} from '@material-ui/core';
import './Authentication.css';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const {user, loading, error } = useSelector((state) => state.auth);
  console.log('Auth state:', { user, loading, error });

  const handleLogin = (e) => {
    e.preventDefault();
    const userData = { email: email , password : password };
    dispatch(login(userData));
  };

  return (
    
    <div style={{backgroundImage: `url(${image})`, backgroundSize: 'cover'}}>
    <Container className='Authentication' >
      <header className='Authentication-header'>
              {loading && <CircularProgress />}
              {user && <Alert severity="success">Authentification avec succés</Alert>}
              {error && <Alert severity="error">Login ou Mot de passe est incorrect</Alert>}
        <Card>
        <div className="max-w-md mx-auto my-10">
            <div className="text-center">
              <img src={logo} alt="My Company Logo" className="w-14 h-26 mx-auto" style={{height: '173px' }}/>
              <h1 className="my-3 text-3xl font-semibold text-dark-200 dark:text-gray-200" style={{color:'#f7d381'}}>Gestion de présence</h1>
            </div>
        </div>
          <CardContent>
            <form onSubmit={handleLogin}> 
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="mb-4"
                disabled={loading}
              >
                Sign In
              </Button>
             
              {/* <div className="d-flex justify-content-between mx-4 mb-4">
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </div> */}
            </form>
          </CardContent>
        </Card>
      </header>
    </Container>
    </div>
  );
};

export default Authentication;