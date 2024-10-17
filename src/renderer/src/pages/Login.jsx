import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios'; // Import axios
import '../assets/css/login.css'; // Import CSS file
import { BaseApiURL } from '../context/ApiURL';

export function Login() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for showing password
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show); // Toggle password visibility
  const handleMouseDownPassword = (event) => event.preventDefault(); // Prevent default behavior

  const handleLogin = async (event) => {
    event.preventDefault();

    const login_api = `${BaseApiURL}/employee/login`;

    try {
      const response = await axios.post(login_api, { email, password });

      if (response.status === 200) {
        const { token } = response.data;
        console.log("🚀 ~ handleLogin ~ token:", token)
        if (token) {
          localStorage.setItem('sessionToken', token);

          const isClockedIn = localStorage.getItem('isClockedIn') === 'true';
          if (isClockedIn) {
            navigate('/');
          } else {
            navigate('/');
            // navigate('/Screenshot')
          }
        } else {
          setErrorMessage('Login successful but no token received');
        }
      } else {
        setErrorMessage('Login failed');
      }
    } catch (error) {
      setErrorMessage(`${error.response.data.message}`);
    }
  };

  return (
    <div className="login-container">
      <Paper elevation={3} className="login-paper">
        <h1 className="login-header">Login Account</h1>
        <FormControl component="form" className="login-form" onSubmit={handleLogin}>
          <TextField
            required
            id="email"
            label="Email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            required
            id="password"
            label="Password"
            placeholder="Your Password"
            type={showPassword ? 'text' : 'password'} // Show or hide password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" className="login-button">
            <FormLabel sx={{ color: '#FFFFFF' }}>Login</FormLabel>
          </Button>
        </FormControl>
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage(null)}
        >
          <Alert onClose={() => setErrorMessage(null)} severity="error" className="login-alert">
            {errorMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </div>
  );
}
