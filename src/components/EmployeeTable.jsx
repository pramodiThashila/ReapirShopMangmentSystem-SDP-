import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import moment from "moment";
import { useNavigate } from 'react-router-dom';

const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/employees/all');
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

    const handleDeleteClick = (id) => {
        setSelectedEmployeeId(id);
        setOpen(true); // Open the confirmation dialog
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/employees/${selectedEmployeeId}`);
            setEmployees(employees.filter(employee => employee.employee_id !== selectedEmployeeId));
            setOpen(false); // Close the dialog
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleClose = () => {
        setOpen(false); // Close the dialog without deleting
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
                                <td className="text-center width-50">
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

            {/* Confirmation Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this employee? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default EmployeeTable;