import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const EmployeeRegister = () => {
    const [employee, setEmployee] = useState({
        first_name: '',
        last_name: '',
        nic: '',
        role: '',
        dob: '',
        email: '',
        username: '',
        password: '',
        phone_number: [], // Initialize as an array
    });
    const [message, setMessage] = useState('');




    // const handleChange = (e) => {
    //   const { name, value } = e.target;
    //   setEmployee({ ...employee, [name]: value });
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone_number") {
            setEmployee((prev) => ({
                ...prev,
                phone_number: value.split(",").map((num) => num.trim()), // Convert to array
            }));
        } else {
            setEmployee((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/employees/register', employee);
            setMessage('Employee registered successfully');
            //navigator('/employees'); // Redirect to employee list or dashboard todo: navigation
            setEmployee({
                first_name: '',
                last_name: '',
                nic: '',
                role: '',
                dob: '',
                email: '',
                username: '',
                password: '',
                phone_number: [],
            });
        } catch (error) {
            setMessage('Error registering employee');
            console.error('Error registering employee:', error);
            if (error.response && error.response.data.errors) {
                setMessage(error.response.data.errors.map((e) => e.msg).join(', ')); // Show error messages
            }
        }

    }


    return (
        <Container maxWidth="sm" sx={{ backgroundColor: '#f5f7fa', padding: '2rem', borderRadius: '8px' }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#000'}}>
                Register Employee
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    label="First Name"
                    name="first_name"
                    value={employee.first_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Last Name"
                    name="last_name"
                    value={employee.last_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="NIC"
                    name="nic"
                    value={employee.nic}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Role"
                    name="role"
                    value={employee.role}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Date Of Birth"
                    name="dob"
                    type="date"
                    value={employee.dob}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={employee.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Telephone Numbers (comma-separated)"
                    name="phone_number"
                    value={employee.phone_number ? employee.phone_number.join(", ") : ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="username"
                    name="username"
                    value={employee.username}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="password"
                    name="password"
                    type="password"
                    value={employee.password}
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
                        color="gray"
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

export default EmployeeRegister;



