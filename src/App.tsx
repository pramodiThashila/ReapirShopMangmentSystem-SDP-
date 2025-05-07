import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import JobStatusPage from './pages/customer/JobStatusPage';
import FeedbackPage from './pages/customer/FeedbackPage';
import QuotationPage from './pages/supplier/QuotationPage';
import OutOfStockPage from './pages/supplier/OutOfStockPage';
import NotFoundPage from './pages/NotFoundPage';
import SupplierHomePage from './pages/SupplierHomePage';
import SupplierRegister from './pages/supplier/supplierRegister';
import SupplierLogin from './pages/supplier/SupplierLogin';
import SupplierProfile from './pages/supplier/SupplierProfile';
import QuotationListPage from './pages/supplier/QuotationListPage';

function App() {
  return (
    <Routes>
      {/* Landing Page (Root Route) */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Layout with Header/Footer for all other routes */}
      <Route element={<Layout />}>
        {/* Customer Pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="job-status" element={<JobStatusPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        
        {/* Supplier Pages */}
        <Route path="supplier" element={<SupplierHomePage />} />
        <Route path="supplier/quotation" element={<QuotationPage />} />
        <Route path="supplier/out-of-stock" element={<OutOfStockPage />} />
        <Route path="supplier/register" element={<SupplierRegister />} />
        <Route path="supplier/login" element={<SupplierLogin />} />
        <Route path="supplier/profile" element={<SupplierProfile />} />
        <Route path="/supplier/quotations" element={<QuotationListPage />} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;