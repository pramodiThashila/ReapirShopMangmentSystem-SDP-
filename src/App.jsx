import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/DashboardUI';
import EmployeeTable from './components/EmployeeTable';
import EmployeeUpdate from './components/EmployeeUpdate';
import Sidebar from './components/Sidebar';
import EmployeeRegister from './components/EmployeeRegister';
import RegisterJobAndCustomer from './components/customerJobAndRegister';
import SupplierRegister from './components/SupplierRegister';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        setIsAuthenticated(true);
        navigate('/dashboard');
    };

    return (
        <div style={{ display: 'flex' }}>
            {isAuthenticated && <Sidebar />}
            <div style={{ flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<Login onLogin={handleLogin} />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<EmployeeTable />} />
                    <Route path="/employees/:id" element={<EmployeeUpdate />} />
                    <Route path="/employees/register" element={<EmployeeRegister />} />
                    <Route path="/jobAndCustomer/register" element={<RegisterJobAndCustomer />} />
                    <Route path="/supplier/register" element={<SupplierRegister />} />
                    
                </Routes>
            </div>
        </div>
    );
}

export default App;