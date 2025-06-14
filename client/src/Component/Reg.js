import React, { useState} from 'react';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const handleRegister = (e) => {
    e.preventDefault(); //will not submit without the values
    // Add registration logic here
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, {name, mail, pass})
    .then(result=>{
        if(result.status===201){
            console.log("User created successfully");
            navigate("/login");
        }
    })
    .catch(err=>{
        if(err.response && err.response.status===400){
            window.alert("Email already exist")
        }else {
          console.log(err);
        }
    })
  }; 

  const [name, setName]= useState("");
  const [mail, setMail]= useState("");
  const [pass, setPassword]= useState(""); 
  const navigate= useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-200 p-4">
      <Box
        component="form"
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <Typography variant="h4" className="text-center text-blue-700 font-bold mb-6">
          Register
        </Typography>

        <div className="space-y-5">
          <TextField
            fullWidth
            onChange={(e)=>setName(e.target.value)}
            name='name'
            label="Username"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            onChange={(e)=>setMail(e.target.value)}
            name='mail'
            label="Email ID"
            variant="outlined"
            type="email"
            required
          />
          <TextField
            fullWidth
            onChange={(e)=>setPassword(e.target.value)}
            name='password'
            label="Password"
            type="password"
            variant="outlined"
            required
          />

          <div className="text-right text-sm text-purple-600">
            <Link href="/login" underline="hover">
              Already have an account? Login
            </Link>
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
            Register
          </Button>
        </div>
      </Box>
    </div>
  );
}

export default RegisterPage;
