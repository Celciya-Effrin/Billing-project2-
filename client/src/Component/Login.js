import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/login", { mail, pass });
      if (res.status === 200) {
        alert("Login successful");
        navigate("/product");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Invalid credentials");
      } else {
        console.error(err);
        alert("Server error");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <Box
        component="form"
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <Typography variant="h4" className="text-center text-blue-700 font-bold mb-6">
          Login
        </Typography>

        <div className="space-y-5">
          <TextField
            fullWidth
            label="Email ID"
            type="email"
            variant="outlined"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />

          <div className="flex justify-between text-sm text-blue-600">
            <Link href="/register" underline="hover">
              Don't have an account? Register
            </Link>
            <Link href="#">Forgot password?</Link>
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' },
              paddingY: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '0.5rem'
            }}
          >
            Login
          </Button>
        </div>
      </Box>
    </div>
  );
}

export default LoginPage;
