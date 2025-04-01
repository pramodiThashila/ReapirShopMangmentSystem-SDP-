import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const SupplierRegister = () => {
    const [supplier, setSupplier] = useState({
        name: '',
        email: '',
        address: '',
        phone_number: [], // Initialize as an array
    });
    const [message, setMessage] = useState('');




    // const handleChange = (e) => {
    //   const { name, value } = e.target;
    //   setsupplier({ ...supplier, [name]: value });
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone_number") {
            setSupplier((prev) => ({
                ...prev,
                phone_number: value.split(",").map((num) => num.trim()), // Convert to array
            }));
        } else {
            setSupplier((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/suppliers/register', supplier);
            setMessage('supplier registered successfully');
            //navigator('/suppliers'); // Redirect to supplier list or dashboard todo: navigation
            setSupplier({
                name: '',
                email: '',
                address: '',
                phone_number: [], // Initialize as an array
            });
        } catch (error) {
            setMessage('Error registering supplier');
            console.error('Error registering supplier:', error);
            if (error.response && error.response.data.errors) {
                setMessage(error.response.data.errors.map((e) => e.msg).join(', ')); // Show error messages
            }
        }

    }


    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Register Supplier
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    label="Supplier Name"
                    name="name"
                    value={supplier.name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />


                <TextField
                    label="Address"
                    name="address"
                    value={supplier.address}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />

                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={supplier.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Telephone Numbers (comma-separated)"
                    name="phone_number"
                    value={supplier.phone_number ? supplier.phone_number.join(", ") : ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required

                />

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2, // Adds spacing between buttons
                        mt: 2 // Adds top margin
                    }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ flex: 1 }} // Ensures both buttons have equal width
                    >
                        Register
                    </Button>
                    <Button
                        type="reset"
                        variant="contained"
                        color="#D3D3D3"
                        sx={{ flex: 1 }} // Ensures both buttons have equal width
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
            {message && (
                <Typography color={message.includes('successfully') ? 'primary' : 'error'} sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}
        </Container>
    );
};

export default SupplierRegister;



