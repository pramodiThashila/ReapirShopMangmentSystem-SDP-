import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/DashboardUI';
import EmployeeTable from './components/EmployeeTable';
import EmployeeUpdate from './components/EmployeeUpdate';
import Sidebar from './components/Sidebar';
import TopBar from './components/Topbar'
import EmployeeRegister from './components/EmployeeRegister';
import RegisterJobAndCustomer from './components/customerJobAndRegister';
import SupplierRegister from './components/SupplierRegister';
import InventoryItemAdd from './components/InventoryItemAdd';
import InventoryBatchAdd from './components/InventoryBatchAdd';
import InventoryView from './components/InventoryView';
import InventoryItemUpdate from './components/InventoryItemUpdate';
import InventoryBatchDetails from './components/InventoryBatchDetails';

import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        setIsAuthenticated(true);
        //navigate('/dashboard');
        navigate('/employees');

    };

    return (
        <div style={{ display: 'flex' }}>
            {isAuthenticated && < TopBar />} 
            <div style={{ flexGrow: 1,marginTop:"50px" }}> 
                <Routes>
                    <Route path="/" element={<Login onLogin={handleLogin} />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<EmployeeTable />} />
                    <Route path="/employees/:id" element={<EmployeeUpdate />} />
                    <Route path="/employees/register" element={<EmployeeRegister />} />
                    <Route path="/jobAndCustomer/register" element={<RegisterJobAndCustomer />} />
                    <Route path="/supplier/register" element={<SupplierRegister />} />
                    <Route path="/inventoryItem/add" element={<InventoryItemAdd />} />
                    <Route path="/inventory/view" element={<InventoryView />} />
                    <Route path='/inventoryItem/batch/add' element={<InventoryBatchAdd />} />
                    <Route path='/inventoryItemUpdate/:id' element={<InventoryItemUpdate />} />
                    <Route path='/inventoryBatchDetails/:inventoryItem_id' element={<InventoryBatchDetails />} />
                    
                </Routes>
            </div>
        </div>
    );
}

export default App;