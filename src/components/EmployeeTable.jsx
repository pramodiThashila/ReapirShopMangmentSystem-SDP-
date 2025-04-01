import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Box, TextField, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import moment from "moment";
//import 'src/index.css';

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
        <div className="container mt-4">
            <h2 className="text-center mb-4">View Employee Details</h2>
            <div className="row mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Employees"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-6 text-end">
                    <button className="btn btn-primary">Sort by Name</button>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th className="text-center">Employee ID</th>
                            <th className="text-center">First Name</th>
                            <th className="text-center">Last Name</th>
                            <th className="text-center">NIC</th>
                            <th className="text-center">DOB</th>
                            <th className="text-center">Role</th>
                            <th className="text-center">Email</th>
                            <th className="text-center">Telephone Number</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee.employee_id}>
                                <td className="text-center">{employee.employee_id}</td>
                                <td className="text-center">{employee.first_name}</td>
                                <td className="text-center">{employee.last_name}</td>
                                <td className="text-center">{employee.nic}</td>
                                <td className="text-center">{moment(employee.dob).format('YYYY-MM-DD')}</td>
                                <td className="text-center">{employee.role}</td>
                                <td className="text-center">{employee.email}</td>
                                <td className="text-center">{employee.phone_number}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleViewClick(employee.employee_id)}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger mt-2"
                                        onClick={() => handleDeleteClick(employee.employee_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeTable;