import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import EmployeeRegister from './pages/EmployeeRegister';
import EmployeeTable from './pages/EmployeeTable';
import InventoryItemAdd from './pages/InventoryItemAdd';
import InventoryView from './pages/InventoryView';
import InventoryBatchAdd from './pages/InventoryBatch';
import InventoryBatchDetails from './pages/InventoryBatch Details';
import SupplierRegister from './pages/SupplierRegister';
import SupplierTable from './pages/SupplierTable';
import InvoiceForm from './pages/FinalInvoice';
import RegisterJobCustomerProduct from './pages/RegisterJobAndCustomer';
import ViewJobs from './pages/JobDetails';
import { UserProvider } from './context/UserContext'; // Import UserProvider

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <UserProvider> {/* Wrap the entire app with UserProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar isCollapsed={isSidebarCollapsed} />
                <div className="flex-1">
                  <Navbar
                    onToggleSidebar={() =>
                      setIsSidebarCollapsed(!isSidebarCollapsed)
                    }
                  />
                  <main>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/employees/register" element={<EmployeeRegister />} />
                      <Route path="/employees" element={<EmployeeTable />} />
                      <Route path="/inventoryItem/add" element={<InventoryItemAdd />} />
                      <Route path="/inventory/view" element={<InventoryView />} />
                      <Route path='/inventoryItem/batch/add' element={<InventoryBatchAdd />} />
                      <Route path='/inventoryBatchDetails/:inventoryItem_id' element={<InventoryBatchDetails />} />
                      <Route path="/supplier/register" element={<SupplierRegister />} />
                      <Route path='/supplier/view' element={<SupplierTable />} />
                      <Route path="/finalInvoice" element={<InvoiceForm />} />
                      <Route path="/jobAndCustomer/register" element={<RegisterJobCustomerProduct />} />
                      <Route path="/jobs/view" element={<ViewJobs />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;