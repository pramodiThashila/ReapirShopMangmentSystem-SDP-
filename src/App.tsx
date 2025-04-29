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
import RegisterJobCustomerProduct from './pages/RegisterJobAndCustomer';
import ViewJobs from './pages/JobDetails';
import { UserProvider } from './context/UserContext'; 
import MyJobs from './pages/MyJobs';
import AdvancePaymentInvoice from './pages/AdvancePaymentInvoice';
import CustomerView from './pages/CustomerView';
 import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceList from './pages/InvoiceList';
import FinalInvoice from './pages/FinalInvoice';
 import AdvanceInvoiceDetails from './pages/AdvanceInvoiceDetails';
import AdvanceInvoiceList from './pages/AdvanceInvoiceList';
import InventoryPurchases from './pages/InventoryPurchasesView';
import UsedInventoryPage from './pages/UsedInventoryPage';
import WarrantyEligibleJobs from './pages/WarrantyEligibleJobs';
import RegisterWarrantyJob from './pages/RegisterWarrantyJob';
//import UsedInventoryList from './components/UsedInventoryList';


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
                      <Route path="/finalInvoice" element={<FinalInvoice/>} />
                      <Route path="/jobAndCustomer/register" element={<RegisterJobCustomerProduct />} />
                      <Route path="/jobs/view" element={<ViewJobs />} />
                      <Route path="/jobs/myJobs" element={<MyJobs />} />
                      <Route path="/advance-payment-invoice" element={<AdvancePaymentInvoice />} />
                      <Route path="customer/view" element={<CustomerView/>} />
                       <Route path="/invoice/:id" element={<InvoiceDetails />} /> 
                      <Route path="/invoices" element={<InvoiceList />} />
                      <Route path="/advance-invoices" element={<AdvanceInvoiceList />} />
                       <Route path="/advance-invoice/:id" element={<AdvanceInvoiceDetails />} /> 
                       <Route path="/inventory-purchases" element={<InventoryPurchases />} />
                       <Route path="/jobs/:jobId/used-inventory" element={<UsedInventoryPage />} />
                       <Route path="/warranty-eligible-jobs" element={<WarrantyEligibleJobs />} />
                       <Route path="/jobs/register-warranty/:id" element={<RegisterWarrantyJob />} />

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