import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Box, TextField, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import moment from "moment";

const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/employees/all');
                console.log('API Response:', response.data);
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    const handleViewClick = (id) => {
        navigate(`/employees/${id}`);
    };

    const handleDeleteClick = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/employees/${id}`);
            setEmployees(employees.filter(employee => employee.id !== id));
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const filteredEmployees = employees.filter(employee =>
        (employee.first_name?.toLowerCase().includes(search.toLowerCase()) || '') ||
        (employee.last_name?.toLowerCase().includes(search.toLowerCase()) || '')
    );



    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom style={{ fontFamily: 'Poppins',fontWeight: 'bold'}}>
                View Employee Details
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Search Employees"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ fontFamily: 'Poppins',fontWeight: 'bold'}}
                />
                <Button variant="contained" sx={{ borderRadius:'15px', fontFamily: 'Poppins',fontWeight: 600 }}>Sort by Name</Button>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ borderCollapse: 'collapse', '& td, & th': { border: '1px solid #ccc' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontFamily: 'Poppins',fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}>Employee ID</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}> First Name</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}> Last Name</TableCell>
                            <TableCell style={{  fontFamily: 'Poppins',fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}>NIC</TableCell>
                            <TableCell style={{  fontFamily: 'Poppins',fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}>DOB</TableCell>
                            <TableCell style={{  fontFamily: 'Poppins',fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}>Role</TableCell>
                            <TableCell style={{  fontFamily: 'Poppins',fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}>Email</TableCell>
                            <TableCell style={{  fontFamily: 'Poppins',fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}>Telephone Number</TableCell>
                            <TableCell style={{  fontFamily: 'Poppins',fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d3d3d3' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEmployees.map((employee) => (
                            <TableRow key={employee.employee_id}>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{employee.employee_id}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{employee.first_name}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{employee.last_name}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{employee.nic}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{moment(employee.dob).format('YYYY-MM-DD')}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{employee.role}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{employee.email}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins', textAlign: 'center', }}>{employee.phone_number}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleViewClick(employee.employee_id)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(employee.employee_id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default EmployeeTable;