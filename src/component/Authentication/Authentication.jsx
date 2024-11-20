import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import { login } from '../../features/authSlice/authSlice';
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
    <Container className='Authentication'>
      <header className='Authentication-header'>
              {loading && <CircularProgress />}
              {user && <Alert severity="success">Authentification avec succés</Alert>}
              {error && <Alert severity="error">Login ou Mot de passe est incorrect</Alert>}
        <Card>
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
             
              <div className="d-flex justify-content-between mx-4 mb-4">
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </header>
    </Container>
  );
};

export default Authentication;