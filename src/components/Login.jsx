import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import bg from '../assets/bg.jpg'; 
//import 'src/index.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const response = await axios.get('http://localhost:5000/api/csrf-token');
            setCsrfToken(response.data.csrfToken);
        };
        fetchCsrfToken();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!email || !password) {
            setMessage('Email and password are required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setMessage('Invalid email address');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/employees/login', { email, password }, {
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            });

            console.log('Response data:', response.data); // Debugging statement

            if (response.data.success) {
                console.log('Navigation to dashboard');
                alert(response.data.message);
                onLogin();
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error logging in');
        }
    };

    return (
        <Container
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh', // Full viewport height
                width: '100vw', // Full viewport width
                backgroundSize: 'cover', // Ensure the image covers the entire area
                backgroundPosition: 'center', // Center the image
                backgroundRepeat: 'no-repeat', // Prevent tiling
                position: 'relative', // For overlay or additional elements
                fontFamily: 'DM Sans, sans-serif',
                margin: 0, // Remove any default margin
                padding: 0,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center', // Center content vertically
                    p: 4,
                    border: '1px solid #ccc',
                    borderRadius: 3,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    backgroundColor: '#fff',
                    fontFamily: 'Poppins',
                    width: '100%',
                    maxWidth: 400,
                }}
            >
                <Typography component="h1" variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', color: '#333', mb: 2, fontWeight: 'bold' }}>
                    Employee Login
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
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
                        sx={{
                            fontFamily: 'Poppins, sans-serif',
                            '& .MuiInputBase-root': { borderRadius: 2 },
                        }}
                    />
                    <TextField
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
                        sx={{
                            fontFamily: 'Poppins, sans-serif',
                            '& .MuiInputBase-root': { borderRadius: 2 },
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 2,
                            fontFamily: 'Poppins, sans-serif',
                            backgroundColor: '#155a9c',
                            color: '#fff',
                        }}
                    >
                        Login
                    </Button>
                </Box>
                {message && <Typography color="error" sx={{ fontFamily: 'Poppins, sans-serif' }}>{message}</Typography>}
            </Box>
        </Container>
    );
};

export default Login;